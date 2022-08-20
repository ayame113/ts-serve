import {
  serveDir,
  type ServeDirOptions,
  serveFile,
  type ServeFileOptions,
} from "https://deno.land/std@0.152.0/http/file_server.ts";
import { contentType } from "https://deno.land/std@0.152.0/media_types/mod.ts";
import { MediaType, transpile } from "../utils/transpile.ts";

const jsContentType = contentType(".js");

/**
 * This can be used in the same way as the [serveFile](https://doc.deno.land/https://deno.land/std@0.152.0/http/file_server.ts/~/serveFile) function of the standard library, but if the file is TypeScript, it will be rewritten to JavaScript.
 *
 * ```ts
 * import { serve } from "https://deno.land/std@0.152.0/http/mod.ts";
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

  let url;
  try {
    url = new URL(request.url, "file:///");
  } catch {
    url = new URL("file:///src");
  }
  // if range request, skip
  if (response.status === 200) {
    if (filePath.endsWith(".ts")) {
      return rewriteTsResponse(response, url, MediaType.TypeScript);
    } else if (filePath.endsWith(".tsx")) {
      return rewriteTsResponse(response, url, MediaType.Tsx);
    } else if (filePath.endsWith(".jsx")) {
      return rewriteTsResponse(response, url, MediaType.Jsx);
    }
  }
  return response;
}

/**
 * This can be used in the same way as the [serveDir](https://doc.deno.land/https://deno.land/std@0.152.0/http/file_server.ts/~/serveDir) function of the standard library, but if the file is TypeScript, it will be rewritten to JavaScript.
 *
 * ```ts
 * import { serve } from "https://deno.land/std@0.152.0/http/mod.ts";
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

  let url;
  try {
    url = new URL(request.url, "file:///");
  } catch {
    return response;
  }
  // if range request, skip
  if (response.status === 200) {
    if (url.pathname.endsWith(".ts")) {
      return rewriteTsResponse(response, url);
    } else if (url.pathname.endsWith(".tsx")) {
      return rewriteTsResponse(response, url);
    } else if (url.pathname.endsWith(".jsx")) {
      return rewriteTsResponse(response, url);
    }
  }
  return response;
}

async function rewriteTsResponse(
  response: Response,
  url: URL,
  mediaType?: MediaType,
) {
  const tsCode = await response.text();
  const jsCode = await transpile(tsCode, url, mediaType);
  const { headers } = response;
  headers.set("content-type", jsContentType);
  headers.delete("content-length");

  return new Response(jsCode, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export { type ServeDirOptions, type ServeFileOptions };
