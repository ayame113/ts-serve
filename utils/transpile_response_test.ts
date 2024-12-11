import { assertEquals } from "@std/assert";
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
      `const a = 'a';\n`,
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
      `const a = 'a';\n`,
    );
  },
});
