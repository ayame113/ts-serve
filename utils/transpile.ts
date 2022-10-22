import { emit } from "https://deno.land/x/emit@0.7.0/mod.ts";

/** File type. You can pass it as an option to the transpile function to tell it what media type the source is. */
export enum MediaType {
  TypeScript,
  Jsx,
  Tsx,
}

// https://github.com/denoland/deno_ast/blob/ea1ccec37e1aa8e5e1e70f983a7ed1472d0e132a/src/media_type.rs#L117
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
  targetUrl: URL,
  mediaType: MediaType,
) {
  const targetUrlStr = targetUrl.toString();
  const result = await emit(targetUrl, {
    load(specifier) {
      if (specifier !== targetUrlStr) {
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
          "content-type": contentType[mediaType],
        },
      });
    },
  });
  return result[targetUrlStr];
}
