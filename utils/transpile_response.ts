import { contentType } from "https://deno.land/std@0.153.0/media_types/mod.ts";
import { MediaType, transpile } from "../utils/transpile.ts";

const jsContentType = contentType(".js");

export async function transpileResponse(
  request: Request,
  response: Response,
  filepath?: string,
): Promise<Response> {
  const url = new URL(`ts-serve:///${request.url}`);
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
