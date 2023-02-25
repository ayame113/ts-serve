import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { MediaType, transpile } from "./transpile.ts";

const codes = [
  [
    MediaType.TypeScript,
    "file:///src.ts",
    "function name(params:type) {}",
    `function name(params) {}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vc3JjLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIG5hbWUocGFyYW1zOnR5cGUpIHt9Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsS0FBSyxNQUFXLEVBQUUsQ0FBQyJ9`,
  ],
  [
    MediaType.Tsx,
    "file:///src.tsx",
    "const a = <a></a>",
    `const a = /*#__PURE__*/ React.createElement("a", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vc3JjLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBhID0gPGE+PC9hPiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLGtCQUFJLG9CQUFDIn0=`,
  ],
  [
    MediaType.Jsx,
    "file:///src.jsx",
    "const a = <a></a>",
    `const a = /*#__PURE__*/ React.createElement("a", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vc3JjLmpzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBhID0gPGE+PC9hPiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLGtCQUFJLG9CQUFDIn0=`,
  ],
  [
    MediaType.Jsx,
    "file:///src.jsx",
    `import { render } from "https://esm.sh/react-dom@18.3.0-next-fecc288b7-20221025/";`,
    "//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiJ9",
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
      `function name(params) {}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZm9vLmNvbS9iYXIiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gbmFtZShwYXJhbXM6dHlwZSkge30iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxLQUFLLE1BQVcsRUFBRSxDQUFDIn0=`,
    );
  },
});
