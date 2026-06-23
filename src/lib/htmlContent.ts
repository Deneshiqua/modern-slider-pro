/** True when content likely contains HTML markup from Trumbowyg (or pasted rich text). */
export function isHtmlContent(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}

/** Strip tags for layout metrics on legacy / rich text elements. */
export function htmlToPlainText(content: string): string {
  if (!content || !isHtmlContent(content)) return content;
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(content, 'text/html');
    return (doc.body.textContent ?? content).replace(/\u00a0/g, ' ');
  }
  return content.replace(/<[^>]*>/g, '');
}
