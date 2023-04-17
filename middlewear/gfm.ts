import { createTranspiler } from "../mod.ts";
import {
  CSS,
  KATEX_CSS,
  render,
  type RenderOptions,
} from "https://deno.land/x/gfm@0.2.0/mod.ts";
import {
  extract,
  test,
} from "https://deno.land/std@0.176.0/encoding/front_matter/any.ts";
import type { JSONValue } from "https://deno.land/std@0.176.0/encoding/jsonc.ts";

export interface MarkdownOptions {
  /** Transpile only if the file name matches this value (format follows URLPattern). */
  targetDir?: string;
  /** If the file name matches this value, it will not be transpiled (format follows URLPattern). */
  excludeDir?: string;
  /** whether to parse frontMatter. If set to true, the parsed frontMatter is given to the argument of the format function. */
  frontMatter?: boolean;
  /** A function that creates full HTML from parsed markdown body. */
  format(
    body: string,
    css: { CSS: string; KATEX_CSS: string },
    frontMatter: JSONValue,
  ): string | Promise<string>;
  /** Options passed to [deno.land/x/gfm](https://deno.land/x/gfm)'s render function */
  renderOptions?: RenderOptions;
}

/** Middleware for converting markdown to HTML using [deno.land/x/gfm](https://deno.land/x/gfm) . */
export function markdown(options: MarkdownOptions) {
  const {
    targetDir,
    excludeDir,
    frontMatter,
    format,
    renderOptions,
  } = options;

  return createTranspiler({
    from: ".md",
    to: ".html",
    targetDir,
    excludeDir,
    fn(content) {
      let attrs: JSONValue = {};
      if (frontMatter && test(content)) {
        ({ body: content, attrs } = extract(content));
      }
      const body = render(content, renderOptions);
      return format(body, { CSS, KATEX_CSS }, attrs);
    },
  });
}
