import { assert } from "@std/assert";
import {
  assertSpyCalls,
  stub,
} from "@std/testing/mock";

import { fourceInstantiateWasm, MediaType, transpile } from "./mod.ts";

Deno.test({
  name: "fourceInstantiateWasm",
  async fn() {
    await fourceInstantiateWasm();
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
  name: "fourceInstantiateWasm - failed to load wasm",
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
      await fourceInstantiateWasm();
      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  },
});
