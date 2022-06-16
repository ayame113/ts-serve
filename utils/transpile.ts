import { emit } from "https://deno.land/x/emit@0.2.0/mod.ts";

// const srcUrl = new URL("file:///src.tsx");
// const srcUrlStr = "file:///src.tsx";
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
