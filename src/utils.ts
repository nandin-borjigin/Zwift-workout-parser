export function makeError(failedString: string) {
  return new Error(`Whoops! Your idiot, yet cute, boy friend must have missed something in his code. Call him!

Cannot parse ${failedString}.
`);
}

export function makeIndentationString(indentation: number): string {
  return "    ".repeat(indentation);
}