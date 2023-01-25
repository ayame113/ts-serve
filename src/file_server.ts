import {
  serveDir,
  type ServeDirOptions,
  serveFile,
  type ServeFileOptions,
} from "https://deno.land/std@0.173.0/http/file_server.ts";

import { transpileResponse } from "../utils/transpile_response.ts";

/**
 * This can be used in the same way as the [serveFile](https://doc.deno.land/https://deno.land/std@0.173.0/http/file_server.ts/~/serveFile) function of the standard library, but if the file is TypeScript, it will be rewritten to JavaScript.
 *
 * ```ts
 * import { serve } from "https://deno.land/std@0.173.0/http/mod.ts";
 * import { serveFileWithTs, fourceInstantiateWasm } from "https://deno.land/x/ts_serve@$VERSION/mod.ts";
 *
 * fourceInstantiateWasm();
 * serve((request) => serveFileWithTs(request, "./mod.ts"));
 * ```
 */
export async function serveFileWithTs(
  request: Request,
  filePath: string,
  options?: ServeFileOptions,
): Promise<Response> {
  const response = await serveFile(request, filePath, options);
  return await transpileResponse(response, request.url, filePath);
}

/**
 * This can be used in the same way as the [serveDir](https://doc.deno.land/https://deno.land/std@0.173.0/http/file_server.ts/~/serveDir) function of the standard library, but if the file is TypeScript, it will be rewritten to JavaScript.
 *
 * ```ts
 * import { serve } from "https://deno.land/std@0.173.0/http/mod.ts";
 * import { serveDirWithTs, fourceInstantiateWasm } from "https://deno.land/x/ts_serve@$VERSION/mod.ts";
 *
 * fourceInstantiateWasm();
 * serve((request) => serveDirWithTs(request));
 * ```
 */
export async function serveDirWithTs(
  request: Request,
  options?: ServeDirOptions,
): Promise<Response> {
  const response = await serveDir(request, options);
  return await transpileResponse(response, request.url);
}

export { type ServeDirOptions, type ServeFileOptions };
