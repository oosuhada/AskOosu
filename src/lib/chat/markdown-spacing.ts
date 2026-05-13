export function normalizeMarkdownSpacing(content: string) {
  const lines = content
    .replace(/\r\n/g, '\n')
    .replace(/\s+---\s+>\s+/g, '\n\n---\n> ')
    .split('\n');
  const normalizedLines: string[] = [];
  let blankLineCount = 0;
  let isInCodeFence = false;

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      isInCodeFence = !isInCodeFence;
      blankLineCount = 0;
      normalizedLines.push(line);
      continue;
    }

    if (!isInCodeFence && line.trim() === '') {
      blankLineCount += 1;
      if (blankLineCount <= 1) {
        normalizedLines.push('');
      }
      continue;
    }

    blankLineCount = 0;
    normalizedLines.push(isInCodeFence ? line : line.replace(/[ \t]+$/g, ''));
  }

  return normalizedLines.join('\n').trim();
}
