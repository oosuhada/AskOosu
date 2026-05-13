import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import rehypePrettyCode from 'rehype-pretty-code';
import type { MDXRemoteProps } from 'next-mdx-remote/rsc';

const blogDirectory = path.join(process.cwd(), 'content/blog');

export type BlogPostMeta = {
  title: string;
  date: string;
  tags: string[];
  description: string;
  slug: string;
  published: boolean;
};

export type BlogPost = BlogPostMeta & {
  body: string;
};

type FrontmatterRecord = Record<string, unknown>;

type RawBlogPostMeta = Omit<BlogPostMeta, 'date'> & {
  date: string | Date;
};

function isFrontmatterValid(data: FrontmatterRecord): data is RawBlogPostMeta {
  return (
    typeof data.title === 'string' &&
    (typeof data.date === 'string' || data.date instanceof Date) &&
    Array.isArray(data.tags) &&
    data.tags.every((tag) => typeof tag === 'string') &&
    typeof data.description === 'string' &&
    typeof data.slug === 'string' &&
    typeof data.published === 'boolean'
  );
}

async function getBlogFilenames() {
  try {
    const entries = await fs.readdir(blogDirectory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
      .map((entry) => entry.name);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function readPost(filename: string): Promise<BlogPost> {
  const fullPath = path.join(blogDirectory, filename);
  const raw = await fs.readFile(fullPath, 'utf8');
  const { data, content } = matter(raw);
  const slugFromFilename = filename.replace(/\.mdx$/, '');

  if (!isFrontmatterValid(data)) {
    throw new Error(`Invalid blog frontmatter: ${filename}`);
  }

  if (data.slug !== slugFromFilename) {
    throw new Error(
      `Blog slug must match filename: ${filename} has slug "${data.slug}"`
    );
  }

  return {
    ...data,
    date:
      data.date instanceof Date
        ? data.date.toISOString().slice(0, 10)
        : data.date,
    body: content,
  };
}

export async function getAllPosts(): Promise<BlogPostMeta[]> {
  const filenames = await getBlogFilenames();
  const posts = await Promise.all(filenames.map((filename) => readPost(filename)));

  return posts
    .filter((post) => post.published)
    .map(toPostMeta)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function toPostMeta(post: BlogPost): BlogPostMeta {
  return {
    title: post.title,
    date: post.date,
    tags: post.tags,
    description: post.description,
    slug: post.slug,
    published: post.published,
  };
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const filename = `${slug}.mdx`;
  const filenames = await getBlogFilenames();

  if (!filenames.includes(filename)) {
    return null;
  }

  const post = await readPost(filename);
  return post.published ? post : null;
}

export async function getRelatedPosts(
  post: BlogPostMeta,
  limit = 3
): Promise<BlogPostMeta[]> {
  const posts = await getAllPosts();
  const tagSet = new Set(post.tags);

  return posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({
      post: candidate,
      score: candidate.tags.filter((tag) => tagSet.has(tag)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
    .slice(0, limit)
    .map(({ post }) => post);
}

function addCopyButtonToCodeBlocks() {
  return (tree: unknown) => {
    const visit = (node: unknown) => {
      if (!node || typeof node !== 'object') return;

      const element = node as {
        type?: string;
        tagName?: string;
        properties?: Record<string, unknown>;
        children?: unknown[];
      };

      if (
        element.type === 'element' &&
        element.tagName === 'figure' &&
        element.properties?.['data-rehype-pretty-code-figure'] !== undefined
      ) {
        element.properties.className = [
          ...toClassList(element.properties.className),
          'blog-code-figure',
        ];
        element.children = [
          {
            type: 'element',
            tagName: 'button',
            properties: {
              type: 'button',
              className: ['blog-code-copy'],
              ariaLabel: 'Copy code block',
            },
            children: [{ type: 'text', value: 'Copy' }],
          },
          ...(element.children ?? []),
        ];
      }

      element.children?.forEach(visit);
    };

    visit(tree);
  };
}

function toClassList(value: unknown) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean);
  return [];
}

export const mdxOptions: MDXRemoteProps['options'] = {
  mdxOptions: {
    rehypePlugins: [
      [
        rehypePrettyCode as never,
        {
          theme: {
            light: 'github-light',
            dark: 'github-dark',
          },
          keepBackground: false,
        },
      ],
      addCopyButtonToCodeBlocks as never,
    ],
  },
};
