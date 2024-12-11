import { assert } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";

import { forceInstantiateWasm, MediaType, transpile } from "./mod.ts";

Deno.test({
  name: "forceInstantiateWasm",
  async fn() {
    await forceInstantiateWasm();
    const start = Date.now();
    await transpile(
      "function foo(arg: string): string {return arg}",
      new URL("file:///src.ts"),
      MediaType.TypeScript,
    );
    const time = Date.now() - start;
    assert(time < 100, `transpile() took ${time} ms`);
  },
});

Deno.test({
  name: "forceInstantiateWasm - failed to load wasm",
  async fn() {
    // Don't throw an error when transpile() throws
    const fetchStub = stub(
      URL.prototype,
      "toString",
      () => {
        throw new Error("load fail!!");
      },
    );
    try {
      await forceInstantiateWasm();
      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  },
});
