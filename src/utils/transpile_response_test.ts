import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { transpileResponse } from "./transpile_response.ts";

Deno.test({
  name: "transpileResponse - ts",
  async fn() {
    const response = await transpileResponse(
      new Response("const a: string = 'a';"),
      "https://aaa/main.ts?aaa=.foo",
      "main.ts",
    );
    assertEquals(
      await response.text(),
      `const a = 'a';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRzLXNlcnZlOi8vL2h0dHBzOi8vYWFhL21haW4udHM/YWFhPS5mb28iXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgYTogc3RyaW5nID0gJ2EnOyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLElBQVkifQ==`,
    );
  },
});

Deno.test({
  name: "transpileResponse - no transpile",
  async fn() {
    const response = await transpileResponse(
      new Response("hey!"),
      "https://aaa/index.html?aaa=.ts",
    );
    assertEquals(await response.text(), "hey!");
  },
});

Deno.test({
  name: "transpileResponse - specify filepath",
  async fn() {
    const response = await transpileResponse(
      new Response("const a: string = 'a';"),
      "https://aaa/index.html?aaa=.ts",
      "foo.ts",
    );
    assertEquals(
      await response.text(),
      `const a = 'a';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRzLXNlcnZlOi8vL2h0dHBzOi8vYWFhL2luZGV4Lmh0bWw/YWFhPS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBhOiBzdHJpbmcgPSAnYSc7Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sSUFBWSJ9`,
    );
  },
});
