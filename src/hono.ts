import { serve } from "https://deno.land/std@0.159.0/http/server.ts";
import { Hono } from "https://deno.land/x/hono@v2.2.5/mod.ts";

const app = new Hono();

app.use(async (v, next) => {
  await next();
  v.newResponse;
  console.log(await v.res.clone().text());
  return new Response();
});

app.get("/", (c) => c.text("Hello! Hono!"));

serve(app.fetch);
