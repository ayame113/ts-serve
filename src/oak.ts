import type { Context, Middleware } from "@oak/oak";

import {
  MediaType,
  transpile,
  type TranspileOptions,
} from "../utils/transpile.ts";

const decoder = new TextDecoder();
const tsType = new Set<string | undefined>(
  ["ts", ".ts", "mts", ".mts", "video/mp2t"],
);
const tsxType = new Set<string | undefined>(["tsx", ".tsx"]);
const jsxType = new Set<string | undefined>(["jsx", ".jsx", "text/jsx"]);

/**
 * Oak middleware that rewrites TypeScript response to JavaScript response (with transpile config).
 *
 * ```ts
 * import { Application } from "@oak/oak";
 * import { createTsMiddleware, fourceInstantiateWasm } from "@ayame113/ts-serve";
 *
 * fourceInstantiateWasm();
 * const app = new Application();
 *
 * // use middleware and transpile TS code
 * app.use(createTsMiddleware({ compilerOptions: { inlineSourceMap: true } }));
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
export function createTsMiddleware(
  transpileOptions?: TranspileOptions,
): Middleware {
  return async function tsMiddleware(
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
      const jsCode = await transpile(
        tsCode,
        specifier,
        mediaType,
        transpileOptions,
      );
      ctx.response.body = jsCode;
    } else if (ctx.response.body instanceof Uint8Array) {
      // major fast path
      const tsCode = decoder.decode(ctx.response.body);
      const jsCode = await transpile(
        tsCode,
        specifier,
        mediaType,
        transpileOptions,
      );
      ctx.response.body = jsCode;
    } else {
      const baseResponse = await ctx.response.toDomResponse();
      const tsCode = await baseResponse.text();
      const jsCode = await transpile(
        tsCode,
        specifier,
        mediaType,
        transpileOptions,
      );

      // hack: override toDomResponse()
      // because oak's convertBodyToBodyInit() is private function.
      ctx.response.toDomResponse = () =>
        Promise.resolve(
          new Response(jsCode, {
            status: baseResponse.status,
            statusText: baseResponse.statusText,
            headers: baseResponse.headers,
          }),
        );
    }
    ctx.response.type = ".js";
  };
}

/**
 * Oak middleware that rewrites TypeScript response to JavaScript response.
 *
 * ```ts
 * import { Application } from "@oak/oak";
 * import { tsMiddleware, fourceInstantiateWasm } from "@ayame113/ts-serve";
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
export const tsMiddleware: Middleware = createTsMiddleware();
export type { TranspileOptions };
