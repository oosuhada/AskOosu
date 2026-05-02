import { Separator } from '@/components/ui/separator';
import { oosuProjects } from '@/lib/oosu-profile';
import { ChevronRight, Link } from 'lucide-react';
import Image from 'next/image';

type OosuProject = (typeof oosuProjects)[number];

const ProjectContent = ({ project }: { project: OosuProject }) => {
  return (
    <div className="space-y-10">
      <div className="rounded-2xl bg-[#F5F5F7] p-8 dark:bg-[#1D1D1F]">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <span>{project.date}</span>
          </div>

          <p className="text-secondary-foreground font-sans text-base leading-relaxed md:text-lg">
            {project.description}
          </p>

          <div className="pt-4">
            <h3 className="mb-3 text-sm tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-neutral-200 px-3 py-1 text-sm text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {project.links.length > 0 && (
        <div className="mb-16">
          <div className="mb-4 flex items-center gap-2 px-6">
            <h3 className="text-sm tracking-wide text-neutral-500 dark:text-neutral-400">
              Links
            </h3>
            <Link className="text-muted-foreground w-4" />
          </div>
          <Separator className="my-4" />
          <div className="space-y-3">
            {project.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl bg-[#F5F5F7] p-4 transition-colors hover:bg-[#E5E5E7] dark:bg-neutral-800 dark:hover:bg-neutral-700"
              >
                <span className="font-light capitalize">{link.name}</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            ))}
          </div>
        </div>
      )}

      {project.images.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {project.images.map((image) => (
              <div
                key={image.src}
                className="relative aspect-video overflow-hidden rounded-2xl bg-neutral-100"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const data = oosuProjects.map((project) => ({
  category: project.category,
  title: project.title,
  src: project.images[0]?.src ?? '/oosu-avatar/hover-01.webp',
  content: <ProjectContent project={project} />,
}));
