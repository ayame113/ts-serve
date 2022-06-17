import { assertEquals } from "https://deno.land/std@0.143.0/testing/asserts.ts";
import { deferred } from "https://deno.land/std@0.143.0/async/mod.ts";
import { Application } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { transpile, tsMiddleware } from "./mod.ts";

const port = 8888;
const jsContentType = "application/javascript; charset=utf-8";

async function startServer() {
  const app = new Application();
  app.use(tsMiddleware);
  app.use(async (ctx, next) => {
    try {
      await ctx.send({ root: "./" });
    } catch {
      await next();
    }
  });
  const killSignal = new AbortController();
  const listenPromise = deferred();
  app.addEventListener("listen", (e) => {
    listenPromise.resolve(e);
  });
  const server = app.listen({ port, signal: killSignal.signal });
  await listenPromise;

  return async function abort() {
    killSignal.abort();
    await server;
  };
}

async function request(path: string) {
  const res = await fetch(`http://localhost:${port}${path}`);
  return {
    result: await res.text(),
    contentType: res.headers.get("Content-Type"),
  };
}
async function readTextFile(path: string) {
  return await Deno.readTextFile(new URL(path, import.meta.url));
}
async function transpileFile(path: string) {
  const url = path.endsWith(".ts")
    ? new URL("file:///src.ts")
    : path.endsWith(".tsx")
    ? new URL("file:///src.tsx")
    : new URL("file:///src.jsx");
  return await transpile(await readTextFile(path), url);
}

Deno.test({
  name: "oak middleware",
  async fn() {
    const abortServer = await startServer();
    {
      const { result, contentType } = await request("/oak_test.ts");
      assertEquals(result, await transpileFile("./oak_test.ts"));
      assertEquals(contentType, jsContentType);
    }
    {
      const { result, contentType } = await request("/oak_test.ts");
      assertEquals(result, await transpileFile("./oak_test.ts"));
      assertEquals(contentType, jsContentType);
    }
    {
      const { result, contentType } = await request(
        "/utils/transpile_bench.ts",
      );
      assertEquals(result, await transpileFile("./utils/transpile_bench.ts"));
      assertEquals(contentType, jsContentType);
    }
    {
      const { result, contentType } = await request("/test/a.tsx");
      assertEquals(result, await transpileFile("./test/a.tsx"));
      assertEquals(contentType, jsContentType);
    }
    {
      const { result, contentType } = await request("/test/a.jsx");
      assertEquals(result, await transpileFile("./test/a.jsx"));
      assertEquals(contentType, jsContentType);
    }
    await abortServer();
  },
});

Deno.test({
  name: "oak middleware - null response",
  async fn() {
    const app = new Application();
    app.use(tsMiddleware);
    app.use((ctx) => {
      ctx.response.body = null;
      ctx.response.type = ".ts";
    });
    const res = await app.handle(new Request("http://localhost/"));
    assertEquals(await res!.text(), "");
  },
});

Deno.test({
  name: "oak middleware - string response",
  async fn() {
    const code = "function name(params:type) {}";
    const app = new Application();
    app.use(tsMiddleware);
    app.use((ctx) => {
      ctx.response.body = code;
      ctx.response.type = ".ts";
    });
    const res = await app.handle(new Request("http://localhost/"));
    assertEquals(
      await res!.text(),
      await transpile(code, new URL("file:///src.ts")),
    );
  },
});

Deno.test({
  name: "oak middleware - u8 response",
  async fn() {
    const code = "function name(params:type) {}";
    const app = new Application();
    app.use(tsMiddleware);
    app.use((ctx) => {
      ctx.response.body = new TextEncoder().encode(code);
      ctx.response.type = ".ts";
    });
    const res = await app.handle(new Request("http://localhost/"));
    assertEquals(
      await res!.text(),
      await transpile(code, new URL("file:///src.ts")),
    );
  },
});

Deno.test({
  name: "oak middleware - func response",
  async fn() {
    const code = "function name(params:type) {}";
    const app = new Application();
    app.use(tsMiddleware);
    app.use((ctx) => {
      ctx.response.body = () => code;
      ctx.response.type = ".ts";
    });
    const res = await app.handle(new Request("http://localhost/"));
    assertEquals(
      await res!.text(),
      await transpile(code, new URL("file:///src.ts")),
    );
  },
});
