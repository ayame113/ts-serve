import {
  assertEquals,
  fail,
} from "https://deno.land/std@0.153.0/testing/asserts.ts";
import { serve } from "https://deno.land/std@0.153.0/http/mod.ts";
import {
  MediaType,
  serveDirWithTs,
  serveFileWithTs,
  transpile,
} from "./mod.ts";

async function readTextFile(path: string) {
  return await Deno.readTextFile(new URL(path, import.meta.url));
}
async function transpileFile(path: string, requestUrl: string) {
  const url = new URL(`ts-serve:///${requestUrl}`);
  const mediaType = path.endsWith(".ts")
    ? MediaType.TypeScript
    : path.endsWith(".tsx")
    ? MediaType.Tsx
    : path.endsWith(".jsx")
    ? MediaType.Jsx
    : fail("unknown extension");
  return await transpile(await readTextFile(path), url, mediaType);
}

Deno.test({
  name: "file server - serveFileWithTs",
  async fn() {
    const controller = new AbortController();
    const serverPromise = serve((request) => {
      const { pathname } = new URL(request.url);

      if (pathname === "/mod.ts") {
        return serveFileWithTs(request, "./mod.ts");
      }
      if (pathname === "/test/a.tsx") {
        return serveFileWithTs(request, "./test/a.tsx");
      }
      if (pathname === "/test/a.jsx") {
        return serveFileWithTs(request, "./test/a.jsx");
      }
      throw new Error("unreachable");
    }, {
      signal: controller.signal,
      port: 8886,
      onListen() {},
    });

    {
      const res = await fetch("http://localhost:8886/mod.ts");
      assertEquals(
        await res.text(),
        await transpileFile("./mod.ts", "http://localhost:8886/mod.ts"),
      );
      assertEquals(
        res.headers.get("Content-Type"),
        "application/javascript; charset=UTF-8",
      );
    }
    {
      const res = await fetch("http://localhost:8886/test/a.tsx");
      assertEquals(
        await res.text(),
        await transpileFile("./test/a.tsx", "http://localhost:8886/test/a.tsx"),
      );
      assertEquals(
        res.headers.get("Content-Type"),
        "application/javascript; charset=UTF-8",
      );
    }
    {
      const res = await fetch("http://localhost:8886/test/a.jsx");
      assertEquals(
        await res.text(),
        await transpileFile("./test/a.jsx", "http://localhost:8886/test/a.jsx"),
      );
      assertEquals(
        res.headers.get("Content-Type"),
        "application/javascript; charset=UTF-8",
      );
    }

    controller.abort();
    await serverPromise;
  },
});

Deno.test({
  name: "file server - serveFileWithTs (not ts file)",
  async fn() {
    const res = await serveFileWithTs(
      new Request("http://localhost/README.md"),
      "./README.md",
    );
    assertEquals(
      await res.text(),
      await readTextFile("./README.md"),
    );
    assertEquals(
      res.headers.get("Content-Type"),
      "text/markdown; charset=UTF-8",
    );
  },
});

Deno.test({
  name: "file server - serveFileWithTs (invalid url)",
  async fn() {
    const request = new Request("http://localhost/");
    Object.defineProperty(request, "url", {
      value: "http://",
    });
    // Determine file type from file path and don't throw error
    const res = await serveFileWithTs(request, "./mod.ts");
    assertEquals(
      await res.text(),
      await transpileFile("./mod.ts", "http://"),
    );
    assertEquals(res.status, 200);
    assertEquals(
      res.headers.get("Content-Type"),
      "application/javascript; charset=UTF-8",
    );
  },
});

Deno.test({
  name: "file server - serveDirWithTs",
  async fn() {
    const controller = new AbortController();
    const serverPromise = serve(
      (request) => serveDirWithTs(request, { quiet: true }),
      {
        signal: controller.signal,
        port: 8887,
        onListen() {},
      },
    );

    {
      const res = await fetch("http://localhost:8887/mod.ts");
      assertEquals(
        await res.text(),
        await transpileFile("./mod.ts", "http://localhost:8887/mod.ts"),
      );
      assertEquals(
        res.headers.get("Content-Type"),
        "application/javascript; charset=UTF-8",
      );
    }
    {
      const res = await fetch("http://localhost:8887/test/a.tsx");
      assertEquals(
        await res.text(),
        await transpileFile("./test/a.tsx", "http://localhost:8887/test/a.tsx"),
      );
      assertEquals(
        res.headers.get("Content-Type"),
        "application/javascript; charset=UTF-8",
      );
    }
    {
      const res = await fetch("http://localhost:8887/test/a.jsx");
      assertEquals(
        await res.text(),
        await transpileFile("./test/a.jsx", "http://localhost:8887/test/a.jsx"),
      );
      assertEquals(
        res.headers.get("Content-Type"),
        "application/javascript; charset=UTF-8",
      );
    }

    controller.abort();
    await serverPromise;
  },
});

Deno.test({
  name: "file server - serveDirWithTs (not ts file)",
  async fn() {
    const res = await serveDirWithTs(
      new Request("http://localhost/README.md"),
      { quiet: true },
    );
    assertEquals(
      await res.text(),
      await readTextFile("./README.md"),
    );
    assertEquals(
      res.headers.get("Content-Type"),
      "text/markdown; charset=UTF-8",
    );
  },
});

Deno.test({
  name: "file server - serveDirWithTs (not found)",
  async fn() {
    const res = await serveDirWithTs(
      new Request("http://localhost/NOT_FOUND"),
      { quiet: true },
    );
    assertEquals(await res.text(), "Not Found");
    assertEquals(res.status, 404);
    assertEquals(
      res.headers.get("Content-Type"),
      "text/plain;charset=UTF-8",
    );
  },
});

Deno.test({
  name: "file server - serveDirWithTs (relative url)",
  async fn() {
    const request = new Request("http://localhost/");
    Object.defineProperty(request, "url", {
      value: "/mod.ts",
    });
    const res = await serveDirWithTs(request, { quiet: true });
    assertEquals(
      await res.text(),
      await transpileFile("./mod.ts", "/mod.ts"),
    );
    assertEquals(
      res.headers.get("Content-Type"),
      "application/javascript; charset=UTF-8",
    );
  },
});

Deno.test({
  name: "file server - serveDirWithTs (invalid url)",
  async fn() {
    const request = new Request("http://localhost/");
    Object.defineProperty(request, "url", {
      value: "http://",
    });
    const res = await serveDirWithTs(request, { quiet: true });
    assertEquals(await res.text(), "Bad Request");
    assertEquals(res.status, 400);
    assertEquals(
      res.headers.get("Content-Type"),
      "text/plain;charset=UTF-8",
    );
  },
});
