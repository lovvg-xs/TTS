
export const splitText = (text: string, maxLength: number): string[] => {
  const chunks: string[] = [];
  let remainingText = text.trim();

  while (remainingText.length > 0) {
    if (remainingText.length <= maxLength) {
      chunks.push(remainingText);
      break;
    }

    let chunk = remainingText.substring(0, maxLength);
    let splitIndex = -1;

    // Prefer splitting at the end of a sentence
    const sentenceEndings = ['.', '!', '?'];
    for (const ending of sentenceEndings) {
      const lastIndex = chunk.lastIndexOf(ending);
      if (lastIndex > splitIndex) {
        splitIndex = lastIndex;
      }
    }

    // If no sentence end, try splitting at a comma or newline
    if (splitIndex === -1 || chunk.substring(splitIndex + 1).length > maxLength * 0.2) { // Avoid tiny leftover sentence fragments
      const lastComma = chunk.lastIndexOf(',');
      if (lastComma > splitIndex) {
        splitIndex = lastComma;
      }
      const lastNewline = chunk.lastIndexOf('\n');
      if (lastNewline > splitIndex) {
        splitIndex = lastNewline;
      }
    }

    // If still no good split point, split at the last space
    if (splitIndex === -1) {
      splitIndex = chunk.lastIndexOf(' ');
    }

    // If no space found, force split at maxLength
    if (splitIndex === -1) {
      splitIndex = maxLength - 1;
    }

    chunks.push(remainingText.substring(0, splitIndex + 1).trim());
    remainingText = remainingText.substring(splitIndex + 1).trim();
  }

  return chunks.filter(chunk => chunk.length > 0);
};
