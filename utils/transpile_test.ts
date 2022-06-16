import { assertEquals } from "https://deno.land/std@0.143.0/testing/asserts.ts";
import { transpile } from "./transpile.ts";

const codes = [
  [
    "file:///src.ts",
    "function name(params:type) {}",
    `function name(params) {}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vc3JjLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIG5hbWUocGFyYW1zOnR5cGUpIHt9Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsSUFBSSxDQUFDLE1BQVcsRUFBRSxFQUFFIn0=`,
  ],
  [
    "file:///src.tsx",
    "const a = <a></a>",
    `const a = /*#__PURE__*/ React.createElement("a", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vc3JjLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBhID0gPGE+PC9hPiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLENBQUMsaUJBQUcsb0JBQUMsR0FBQyxPQUFLIn0=`,
  ],
] as const;
for (const [path, src, emit] of codes) {
  Deno.test({
    name: `transpile - '${src}'`,
    async fn() {
      assertEquals(await transpile(src, new URL(path)), emit);
    },
  });
}
