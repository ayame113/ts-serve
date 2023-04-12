import { contentType } from "https://deno.land/std@0.178.0/media_types/mod.ts";
import { MediaType, transpile } from "../utils/transpile.ts";

const jsContentType = contentType(".js");

/**
 * Transpile the body of the response and return a new response.
 *
 * ```ts
 * import { serve } from "https://deno.land/std@0.178.0/http/mod.ts";
 * import { serveFile } from "https://deno.land/std@0.178.0/http/file_server.ts";
 *
 * import { transpileResponse } from "https://deno.land/x/ts_serve@$MODULE_VERSION/utils/transpile_response.ts"
 *
 * serve(async (request) => {
 *   const filePath = "./mod.ts";
 *   const response = await serveFile(request, filePath);
 *   return await transpileResponse(response, request.url, filePath);
 * });
 * ```
 *
 * @param  response The response you want to transpile
 * @param  requestUrl The URL used to construct the source map URL
 * @param  filepath If specified, the file path extension is used to determine the file type.
 */
export async function transpileResponse(
  response: Response,
  requestUrl: string,
  filepath?: string,
): Promise<Response> {
  const url = new URL(`ts-serve:///${requestUrl}`);
  // if range request, skip
  if (response.status !== 200) {
    return response;
  }
  const pathname = filepath !== undefined ? filepath : url.pathname;
  if (pathname.endsWith(".ts")) {
    return await rewriteTsResponse(response, url, MediaType.TypeScript);
  } else if (pathname.endsWith(".tsx")) {
    return await rewriteTsResponse(response, url, MediaType.Tsx);
  } else if (pathname.endsWith(".jsx")) {
    return await rewriteTsResponse(response, url, MediaType.Jsx);
  } else {
    return response;
  }
}

async function rewriteTsResponse(
  response: Response,
  url: URL,
  mediaType: MediaType,
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
