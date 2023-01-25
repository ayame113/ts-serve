export * from "./src/oak.ts";
export * from "./src/file_server.ts";
export * from "./utils/transpile.ts";
import { MediaType, transpile } from "./utils/transpile.ts";

/**
 * **Calling this function has no effect whether it is called or not.**
 * Calling this function will force the loading of the wasm file used internally.
 * For performance sensitive servers, etc., call this function first to tell it to load wasm.
 * There is no need to call this function where performance is not important. In that case, the wasm file will be automatically loaded in about 3 seconds when you transpile for the first time.
 *
 * ```ts
 * import { serve } from "https://deno.land/std@0.173.0/http/mod.ts";
 * import { serveDirWithTs, fourceInstantiateWasm } from "https://deno.land/x/ts_serve@$VERSION/mod.ts";
 *
 * fourceInstantiateWasm();
 * serve((request) => serveDirWithTs(request));
 * ```
 */
export async function fourceInstantiateWasm() {
  try {
    await transpile("", new URL("file:///src"), MediaType.TypeScript);
  } catch (_) { /* ignore error*/ }
}
