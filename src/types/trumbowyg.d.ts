import 'jquery';

interface TrumbowygOptions {
  btns?: Array<string | string[]>;
  semantic?: boolean;
  autogrow?: boolean;
  resetCss?: boolean;
  removeformatPasted?: boolean;
  svgPath?: string;
  tagsToRemove?: string[];
}

interface JQuery {
  trumbowyg(method: 'destroy'): JQuery;
  trumbowyg(method: 'html'): string;
  trumbowyg(method: 'html', html: string): JQuery;
  trumbowyg(method: 'empty'): JQuery;
  trumbowyg(options?: TrumbowygOptions): JQuery;
}
