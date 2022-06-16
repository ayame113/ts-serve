import {
  serveDir,
  ServeDirOptions,
  serveFile,
  ServeFileOptions,
} from "https://deno.land/std@0.144.0/http/file_server.ts";
import { contentType } from "https://deno.land/std@0.144.0/media_types/mod.ts";
import type { Context } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { convertBodyToBodyInit } from "https://deno.land/x/oak@v10.6.0/response.ts";
import { transpile } from "./utils/transpile.ts";

const decoder = new TextDecoder();
const tsType = new Set<string | undefined>(
  ["ts", ".ts", "mts", ".mts", "video/mp2t"],
);
const tsxType = new Set<string | undefined>(["tsx", ".tsx"]);
const tsUrl = new URL("file:///src.ts");
const tsxUrl = new URL("file:///src.tsx");
const jsContentType = contentType(".js")!;

/**
 * This can be used in the same way as the [serveFile](https://doc.deno.land/https://deno.land/std@0.144.0/http/file_server.ts/~/serveFile) function of the standard library, but if the file is TypeScript, it will be rewritten to JavaScript.
 *
 * ```ts
 * import { serve } from "https://deno.land/std@0.144.0/http/mod.ts";
 * import { serveFileWithTs } from "./mod.ts";
 *
 * serve((request) => serveFileWithTs(request, "./mod.ts"));
 * ```
 */
export async function serveFileWithTs(
  request: Request,
  filePath: string,
  options?: ServeFileOptions,
): Promise<Response> {
  const response = await serveFile(request, filePath, options);
  // if range request, skip
  if (response.status === 200) {
    if (filePath.endsWith(".ts")) {
      return rewriteTsResponse(response, tsUrl);
    } else if (filePath.endsWith(".tsx")) {
      return rewriteTsResponse(response, tsxUrl);
    }
  }
  return response;
}

/**
 * This can be used in the same way as the [serveDir](https://doc.deno.land/https://deno.land/std@0.144.0/http/file_server.ts/~/serveDir) function of the standard library, but if the file is TypeScript, it will be rewritten to JavaScript.
 *
 * ```ts
 * import { serve } from "https://deno.land/std@0.144.0/http/mod.ts";
 * import { serveDirWithTs } from "./mod.ts";
 *
 * serve((request) => serveDirWithTs(request));
 * ```
 */
export async function serveDirWithTs(
  request: Request,
  options?: ServeDirOptions,
): Promise<Response> {
  let pathname;
  try {
    pathname = new URL(request.url).pathname;
  } catch {
    return await serveDir(request, options);
  }
  const response = await serveDir(request);
  // if range request, skip
  if (response.status === 200) {
    console.log(pathname);

    if (pathname.endsWith(".ts")) {
      return rewriteTsResponse(response, tsUrl);
    } else if (pathname.endsWith(".tsx")) {
      return rewriteTsResponse(response, tsxUrl);
    }
  }
  return response;
}

async function rewriteTsResponse(response: Response, url: URL) {
  const tsCode = await response.text();
  const jsCode = await transpile(tsCode, url);
  const { headers } = response;
  headers.set("content-type", jsContentType);
  headers.delete("content-length");

  return new Response(jsCode, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Oak middleware that rewrites TypeScript response to JavaScript response.
 *
 * ```ts
 * import { Application } from "https://deno.land/x/oak@v10.6.0/mod.ts";
 * import { tsMiddleware } from "./mod.ts";
 *
 * const app = new Application();
 * app.use(tsMiddleware);
 * app.use(async (ctx, next) => {
 *   try {
 *     await ctx.send({ root: "./" });
 *   } catch {
 *     await next();
 *   }
 * });
 * await app.listen({ port: 8000 });
 * ```
 */
export async function tsMiddleware(
  ctx: Context,
  next: () => Promise<unknown>,
) {
  await next();
  const specifier = tsType.has(ctx.response.type)
    ? tsUrl
    : tsxType.has(ctx.response.type)
    ? tsxUrl
    : undefined;

  if (specifier) {
    if (ctx.response.body == null) {
      // skip
    } else if (ctx.response.body instanceof Uint8Array) {
      // major fast path
      const tsCode = decoder.decode(ctx.response.body);
      const jsCode = await transpile(tsCode, specifier);
      ctx.response.body = jsCode;
    } else {
      // fallback
      const [responseInit] = await convertBodyToBodyInit(ctx.response.body);
      const tsCode = await new Response(responseInit).text();
      const jsCode = await transpile(tsCode, specifier);
      ctx.response.body = jsCode;
    }
    ctx.response.type = ".js";
  }
}

export { type ServeDirOptions, type ServeFileOptions, transpile };
