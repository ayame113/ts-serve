import { emit } from "https://deno.land/x/emit@0.4.0/mod.ts";

/** File type. You can pass it as an option to the transpile function to tell it what media type the source is. */
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
 * @param specifier The URL that will be used for the source map.
 * @param mediaType Indicates whether the source code is TypeScript, JSX or TSX. If this argument is not passed, the file type is guessed using the extension of the URL passed as the second argument.
 * @return JavaScript code
 *
 * ```ts
 * import { transpile, MediaType } from "https://deno.land/x/ts_serve@$VERSION/mod.ts";
 * console.log(await transpile(
 *   "function name(params:type) {}",
 *   new URL("file:///src.ts"),
 *   MediaType.TypeScript,
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
