import { MediaType, transpile } from "../mod.ts";

const codes = ["function name(params:type) {}"];
const url = new URL("file:///src.ts");
for (const src of codes) {
  Deno.bench({
    name: "transpile",
    async fn() {
      await transpile(src, url, MediaType.TypeScript);
    },
  });
}
