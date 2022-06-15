import type { Context } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { convertBodyToBodyInit } from "https://deno.land/x/oak@v10.6.0/response.ts";
export { transpile } from "./utils/transpile.ts";
import { transpile } from "./utils/transpile.ts";

const decoder = new TextDecoder();
const encoder = new TextEncoder();
const tsType = new Set<string | undefined>([
  "ts",
  ".ts",
  "mts",
  ".mts",
  "video/mp2t",
]);
const tsxType = new Set<string | undefined>(["tsx", ".tsx"]);

export async function tsMiddleware(
  ctx: Context,
  next: () => Promise<unknown>,
) {
  console.log(ctx.response);
  await next();
  console.log(ctx.response);
  const specifier = tsType.has(ctx.response.type)
    ? "file:///src.ts"
    : tsxType.has(ctx.response.type)
    ? "file:///src.tsx"
    : undefined;

  if (specifier) {
    if (ctx.response.body == null) {
      // skip
    } else if (ctx.response.body instanceof Uint8Array) {
      // major fast path
      const tsCode = decoder.decode(ctx.response.body);
      const jsCode = await transpile(tsCode, specifier);
      ctx.response.body = encoder.encode(jsCode);
    } else {
      // fallback
      const [responseInit] = await convertBodyToBodyInit(ctx.response.body);
      const tsCode = await new Response(responseInit).text();
      const jsCode = await transpile(tsCode, specifier);
      ctx.response.body = encoder.encode(jsCode);
    }
    ctx.response.type = ".js";
  }
}
