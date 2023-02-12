import type { Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { convertBodyToBodyInit } from "https://deno.land/x/oak@v11.1.0/response.ts";

import { MediaType, transpile } from "../utils/transpile.ts";

const decoder = new TextDecoder();
const tsType = new Set<string | undefined>(
  ["ts", ".ts", "mts", ".mts", "video/mp2t"],
);
const tsxType = new Set<string | undefined>(["tsx", ".tsx"]);
const jsxType = new Set<string | undefined>(["jsx", ".jsx", "text/jsx"]);

/**
 * Oak middleware that rewrites TypeScript response to JavaScript response.
 *
 * ```ts
 * import { Application } from "https://deno.land/x/oak@v11.1.0/mod.ts";
 * import { tsMiddleware, fourceInstantiateWasm } from "https://deno.land/x/ts_serve@$MODULE_VERSION/mod.ts";
 *
 * fourceInstantiateWasm();
 * const app = new Application();
 *
 * // use middleware and transpile TS code
 * app.use(tsMiddleware);
 *
 * // serve static file
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
  const mediaType = tsType.has(ctx.response.type)
    ? MediaType.TypeScript
    : tsxType.has(ctx.response.type)
    ? MediaType.Tsx
    : jsxType.has(ctx.response.type)
    ? MediaType.Jsx
    : undefined;

  if (mediaType == undefined) {
    return;
  }

  const specifier = ctx.request.url;

  if (ctx.response.body == null) {
    // skip
  } else if (typeof ctx.response.body === "string") {
    // major fast path
    const tsCode = ctx.response.body;
    const jsCode = await transpile(tsCode, specifier, mediaType);
    ctx.response.body = jsCode;
  } else if (ctx.response.body instanceof Uint8Array) {
    // major fast path
    const tsCode = decoder.decode(ctx.response.body);
    const jsCode = await transpile(tsCode, specifier, mediaType);
    ctx.response.body = jsCode;
  } else {
    // fallback
    const [responseInit] = await convertBodyToBodyInit(ctx.response.body);
    const tsCode = await new Response(responseInit).text();
    const jsCode = await transpile(tsCode, specifier, mediaType);
    ctx.response.body = jsCode;
  }
  ctx.response.type = ".js";
}
