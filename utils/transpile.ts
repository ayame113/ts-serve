import { emit } from "https://deno.land/x/emit@0.2.0/mod.ts";

/**
 * Transpile the given TypeScript code into JavaScript code.
 * @param content TypeScript code
 * @param specifier URL like `new URL("file:///src.ts")` or `new URL("file:///src.tsx")`
 * @return JavaScript code
 */
export async function transpile(content: string, specifier: URL) {
  const urlStr = specifier.toString();
  const result = await emit(specifier, {
    load(specifier) {
      if (specifier !== urlStr) {
        return Promise.resolve({ kind: "module", specifier, content: "" });
      }
      return Promise.resolve({ kind: "module", specifier, content });
    },
  });
  return result[urlStr];
}
