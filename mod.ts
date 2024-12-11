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
 * ```ts ignore
 * import { serveDirWithTs, forceInstantiateWasm } from "@ayame113/ts-serve";
 *
 * // load the wasm file in the background when the server starts.
 * forceInstantiateWasm();
 * Deno.serve((request) => serveDirWithTs(request));
 * ```
 *
 * @deprecated please use [jsr](https://jsr.io/@ayame113/ts-serve) version
 */
export async function forceInstantiateWasm() {
  try {
    await transpile("", new URL("file:///src"), MediaType.TypeScript);
  } catch (_) { /* ignore error*/ }
}

export const fourceInstantiateWasm = forceInstantiateWasm;
