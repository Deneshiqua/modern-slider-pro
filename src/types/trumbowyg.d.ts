interface TrumbowygOptions {
  btns?: Array<string | string[]>;
  semantic?: boolean;
  autogrow?: boolean;
  resetCss?: boolean;
  removeformatPasted?: boolean;
  svgPath?: string;
  tagsToRemove?: string[];
}

interface JQuery<TElement = HTMLElement> {
  trumbowyg(method: 'destroy'): this;
  trumbowyg(method: 'html'): string;
  trumbowyg(method: 'html', html: string): this;
  trumbowyg(method: 'empty'): this;
  trumbowyg(options?: TrumbowygOptions): this;
}
