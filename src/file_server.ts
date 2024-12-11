import {
  serveDir,
  type ServeDirOptions,
  serveFile,
  type ServeFileOptions,
} from "@std/http/file-server";

import { transpileResponse } from "../utils/transpile_response.ts";
import type { TranspileOptions } from "../utils/transpile.ts";

/**
 * This can be used in the same way as the [serveFile](https://jsr.io/@std/http/doc/~/serveFile) function of the standard library, but if the file is TypeScript, it will be rewritten to JavaScript.
 *
 * ```ts ignore
 * import { serveFileWithTs, forceInstantiateWasm } from "@ayame113/ts-serve";
 *
 * forceInstantiateWasm();
 * Deno.serve((request) => serveFileWithTs(request, "./mod.ts"));
 * ```
 * @deprecated please use [jsr](https://jsr.io/@ayame113/ts-serve) version
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
 * ```ts ignore
 * import { serveDirWithTs, forceInstantiateWasm } from "@ayame113/ts-serve";
 *
 * forceInstantiateWasm();
 * Deno.serve((request) => serveDirWithTs(request));
 * ```
 * @deprecated please use [jsr](https://jsr.io/@ayame113/ts-serve) version
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

export type { ServeDirOptions, ServeFileOptions, TranspileOptions };
