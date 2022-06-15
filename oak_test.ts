import { Application } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { tsMiddleware } from "./mod.ts";

const app = new Application();
app.use(tsMiddleware);
app.use(async (ctx, next) => {
  try {
    await ctx.send({ root: "./" });
  } catch {
    await next();
  }
});

await app.listen({ port: 8000 });
(function name(arg: string) {
  arg;
})("");
