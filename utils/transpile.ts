import { emit } from "https://deno.land/x/emit@0.4.0/mod.ts";

export enum MediaType {
  TypeScript,
  Jsx,
  Tsx,
}

const contentType = {
  [MediaType.TypeScript]: "text/typescript; charset=utf-8",
  [MediaType.Jsx]: "text/jsx; charset=utf-8",
  [MediaType.Tsx]: "text/tsx; charset=utf-8",
};

/**
 * Transpile the given TypeScript code into JavaScript code.
 *
 * @param content TypeScript code
 * @param specifier URL like `new URL("file:///src.ts")` or `new URL("file:///src.tsx")`
 * @return JavaScript code
 *
 * ```ts
 * import { transpile } from "https://deno.land/x/ts_serve@$VERSION/mod.ts";
 * console.log(await transpile(
 *   "function name(params:type) {}",
 *   new URL("file:///src.ts")
 * ));
 * ```
 */
export async function transpile(
  content: string,
  specifier: URL,
  mediaType?: MediaType,
) {
  const urlStr = specifier.toString();
  const result = await emit(specifier, {
    load(specifier) {
      if (specifier !== urlStr) {
        return Promise.resolve({
          kind: "module",
          specifier,
          content: "",
          headers: { "content-type": "application/javascript; charset=utf-8" },
        });
      }
      return Promise.resolve({
        kind: "module",
        specifier,
        content,
        headers: {
          "content-type": mediaType != undefined
            ? contentType[mediaType]
            : undefined!,
        },
      });
    },
  });
  return result[urlStr];
}
