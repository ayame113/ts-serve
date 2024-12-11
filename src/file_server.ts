import {
  serveDir,
  type ServeDirOptions,
  serveFile,
  type ServeFileOptions,
} from "@std/http/file-server";

import { transpileResponse } from "../utils/transpile_response.ts";
import { TranspileOptions } from "../utils/transpile.ts";

/**
 * This can be used in the same way as the [serveFile](https://jsr.io/@std/http/doc/~/serveFile) function of the standard library, but if the file is TypeScript, it will be rewritten to JavaScript.
 *
 * ```ts
 * import { serveFileWithTs, fourceInstantiateWasm } from "@ayame113/ts-serve";
 *
 * fourceInstantiateWasm();
 * Deno.serve((request) => serveFileWithTs(request, "./mod.ts"));
 * ```
 */
export async function serveFileWithTs(
  request: Request,
  filePath: string,
  options?: ServeFileOptions,
  transpileOptions?: TranspileOptions,
): Promise<Response> {
  const response = await serveFile(request, filePath, options);
  return await transpileResponse(
    response,
    request.url,
    filePath,
    transpileOptions,
  );
}

/**
 * This can be used in the same way as the [serveDir](https://jsr.io/@std/http/doc/~/serveDir) function of the standard library, but if the file is TypeScript, it will be rewritten to JavaScript.
 *
 * ```ts
 * import { serveDirWithTs, fourceInstantiateWasm } from "@ayame113/ts-serve";
 *
 * fourceInstantiateWasm();
 * Deno.serve((request) => serveDirWithTs(request));
 * ```
 */
export async function serveDirWithTs(
  request: Request,
  options?: ServeDirOptions,
  transpileOptions?: TranspileOptions,
): Promise<Response> {
  const response = await serveDir(request, options);
  return await transpileResponse(
    response,
    request.url,
    undefined,
    transpileOptions,
  );
}

export { type ServeDirOptions, type ServeFileOptions, type TranspileOptions };
