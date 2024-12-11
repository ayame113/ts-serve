import { assertEquals } from "@std/assert";
import { MediaType, transpile } from "./transpile.ts";

const codes = [
  [
    MediaType.TypeScript,
    "file:///src.ts",
    "function name(params:type) {}",
    `function name(params) {}\n`,
  ],
  [
    MediaType.Tsx,
    "file:///src.tsx",
    "const a = <a></a>",
    `const a = /*#__PURE__*/ React.createElement("a", null);\n`,
  ],
  [
    MediaType.Jsx,
    "file:///src.jsx",
    "const a = <a></a>",
    `const a = /*#__PURE__*/ React.createElement("a", null);\n`,
  ],
  [
    MediaType.Jsx,
    "file:///src.jsx",
    `import { render } from "https://esm.sh/react-dom@19.0.0/";`,
    "",
  ],
] as const;
for (const [mediaType, path, src, emit] of codes) {
  Deno.test({
    name: `transpile - '${src}'`,
    async fn() {
      assertEquals(await transpile(src, new URL(path), mediaType), emit);
    },
  });
}

Deno.test({
  name: `transpile - with no extension`,
  async fn() {
    assertEquals(
      await transpile(
        "function name(params:type) {}",
        new URL("https://foo.com/bar"),
        MediaType.TypeScript,
      ),
      `function name(params) {}\n`,
    );
  },
});
