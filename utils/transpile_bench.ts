import { transpile } from "./transpile.ts";

const codes = ["function name(params:type) {}"];
for (const src of codes) {
  Deno.bench({
    name: "transpile",
    async fn() {
      await transpile(src, "file:///src.ts");
    },
  });
}
