import type { ConnInfo } from "https://deno.land/std@0.178.0/http/mod.ts";
import { serveDir } from "https://deno.land/std@0.178.0/http/file_server.ts";
import { contentType } from "https://deno.land/std@0.178.0/media_types/mod.ts";
import { extname } from "https://deno.land/std@0.178.0/path/mod.ts";

/** Middleware type used in `App#use`. */
export type Middleware = (
  req: Request,
  next: (req: Request) => Promise<Response>,
  conn: ConnInfo,
  ctx: Context,
) => Promise<Response>;

/** The type of context passed to the middleware. */
export interface Context<T extends `.${string}` = `.${string}`> {
  /** Represents the current file type. An extension is usually used. (e.g. `.ts`, `.md`) */
  type: T;
}

/**
 * Create a file server. You can apply middleware to each request using the `app.use` method.
 *
 * Middleware runs similar to express, oak, and hono, but it is specialized for file servers and can be used in conjunction with other frameworks.
 *
 * ```ts
 * import { serve } from "https://deno.land/std@0.178.0/http/mod.ts";
 * import { App } from "https://deno.land/x/ts_serve@$MODULE_VERSION/mod.ts";
 * import { tsServe } from "https://deno.land/x/ts_serve@$MODULE_VERSION/middlewear/ts-serve.ts";
 *
 * const app = new App();
 *
 * // use middleware
 * app.use(tsServe());
 *
 * // serve handler
 * serve(app.handler);
 * ```
 */
export class App {
  #handler;
  #middleware: Middleware[] = [];
  constructor({ handler = serveDir }: {
    handler?: (req: Request) => Response | Promise<Response>;
  } = {}) {
    this.#handler = handler;
  }
  /** Add middleware to the server. */
  use(...middleware: Middleware[]) {
    this.#middleware.push(...middleware);
    return this;
  }
  /** Server handler function. It takes a Request object and returns a Response object. */
  handler = async (req: Request, conn: ConnInfo): Promise<Response> => {
    // not supported range request
    if (req.headers.has("Range")) {
      req = new Request(req);
      req.headers.delete("Range");
    }
    const { pathname } = new URL(req.url);
    const ctx: Context = {
      type: extname(pathname) as `.${string}` || ".html", // todo handle index.html or other
    };
    return await this.#dispatchMiddleware(0, req, conn, ctx);
  };
  async #dispatchMiddleware(
    i: number,
    req: Request,
    conn: ConnInfo,
    ctx: Context,
  ): Promise<Response> {
    if (i === this.#middleware.length) {
      return await this.#handler(req);
    }
    return await this.#middleware[i](
      req,
      (req) => this.#dispatchMiddleware(i + 1, req, conn, ctx),
      conn,
      ctx,
    );
  }
}

export interface TranspilerOptions<
  F extends `.${string}`,
  T extends "string" | "arrayBuffer" | undefined,
> {
  /** Extension to transpile. */
  from: F | readonly F[];
  /** Extension after transpilation. */
  to: `.${string}`;
  /** Type of argument passed to optional function `fn`. */
  type?: T;
  /** Transpile only if the file name matches this value (format follows URLPattern). */
  targetDir?: string;
  /** If the file name matches this value, it will not be transpiled (format follows URLPattern). */
  excludeDir?: string;
  /** Function called when transpiling. Takes the pre-transpiled content as an argument and returns the post-transpiled value. */
  fn(originalContent: T extends "arrayBuffer" ? ArrayBuffer : string, options: {
    ctx: Context<F>;
    conn: ConnInfo;
    request: Request;
    response: Response;
  }):
    | Promise<string | Uint8Array | ReadableStream<Uint8Array>>
    | string
    | Uint8Array
    | ReadableStream<Uint8Array>;
}

/** Utilities for creating middleware. You can create middleware that transpiles only certain extensions. */
export function createTranspiler<
  F extends `.${string}`,
  T extends "string" | "arrayBuffer" | undefined = "string",
>(
  options: TranspilerOptions<F, T>,
): Middleware {
  const { from, to, type = "string", targetDir, excludeDir, fn } = options;
  const preExtensions = new Set(Array.isArray(from) ? from : [from]);
  const postMediaType = contentType(to);
  const includePattern = targetDir
    ? new URLPattern({ pathname: targetDir })
    : undefined;
  const excludePattern = excludeDir
    ? new URLPattern({ pathname: excludeDir })
    : undefined;

  return async function (req, next, conn, ctx) {
    const res = await next(req);
    if (includePattern && !includePattern.test(req.url)) {
      return res;
    }
    if (excludePattern && excludePattern.test(req.url)) {
      return res;
    }
    if (res.status !== 200) {
      return res;
    }
    if (!preExtensions.has(ctx.type)) {
      return res;
    }

    let content;
    switch (type) {
      case "string":
        content = await res.text();
        break;
      case "arrayBuffer":
        content = await res.arrayBuffer();
        break;
      default: {
        const _: never = type;
        throw new Error("unreachable");
      }
    }
    const transpiled = await fn(
      content as T extends "arrayBuffer" ? ArrayBuffer : string,
      {
        ctx: ctx as Context<F>,
        conn,
        request: req,
        response: res,
      },
    );
    if (transpiled == null) {
      console.warn("Transpile skipped because transpiler returned null.");
      return new Response(content, {
        headers: res.headers,
        status: res.status,
        statusText: res.statusText,
      });
    }

    if (postMediaType) {
      res.headers.set("Content-Type", postMediaType);
    } else {
      res.headers.delete("Content-Type");
    }
    res.headers.delete("Content-Length");
    ctx.type = to;

    return new Response(transpiled, {
      headers: res.headers,
      status: res.status,
      statusText: res.statusText,
    });
  };
}
