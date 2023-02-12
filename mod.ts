export * from "./src/oak.ts";
export * from "./src/file_server.ts";
export * from "./utils/transpile.ts";
import { MediaType, transpile } from "./utils/transpile.ts";

/**
 * Calling this function will load the wasm file used in the deno_emit of the dependency.
 * Even if you don't call this function, if you call the transpile function, the wasm file will be read automatically at that timing.
 * However, performance can be an issue on the server as loading the wasm file takes time.
 * In that case, calling this function in advance can speed up later calls to the transpile function.
 *
 * ```ts
 * import { serve } from "https://deno.land/std@0.173.0/http/mod.ts";
 * import { serveDirWithTs, fourceInstantiateWasm } from "https://deno.land/x/ts_serve@$VERSION/mod.ts";
 *
 * // load the wasm file in the background when the server starts.
 * fourceInstantiateWasm();
 * serve((request) => serveDirWithTs(request));
 * ```
 */
export async function fourceInstantiateWasm() {
  try {
    await transpile("", new URL("file:///src"), MediaType.TypeScript);
  } catch (_) { /* ignore error*/ }
}
