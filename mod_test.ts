import { fourceInstantiateWasm, transpile } from "./mod.ts";
import { assert } from "https://deno.land/std@0.152.0/testing/asserts.ts";

Deno.test({
  name: "fourceInstantiateWasm",
  async fn() {
    await fourceInstantiateWasm();
    const start = Date.now();
    await transpile(
      "function foo(arg: string): string {return arg}",
      new URL("file:///src.ts"),
    );
    const time = Date.now() - start;
    assert(time < 100, `transpile() took ${time} ms`);
  },
});
