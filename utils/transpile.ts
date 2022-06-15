import { emit } from "https://deno.land/x/emit@0.2.0/mod.ts";

// const srcUrl = new URL("file:///src.tsx");
// const srcUrlStr = "file:///src.tsx";
export async function transpile(content: string, filepath: string) {
  const url = new URL(filepath);
  const urlStr = url.toString();
  console.log(url, urlStr);

  const result = await emit(url, {
    load(specifier) {
      console.log(specifier);

      if (specifier !== urlStr) {
        return Promise.resolve({ kind: "module", specifier, content: "" });
      }
      return Promise.resolve({ kind: "module", specifier, content });
    },
  });
  return result[urlStr];
}
