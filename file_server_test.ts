import { assertEquals } from "https://deno.land/std@0.143.0/testing/asserts.ts";
import { serve } from "https://deno.land/std@0.144.0/http/mod.ts";
import { serveDirWithTs, serveFileWithTs, transpile } from "./mod.ts";

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
    });

    {
      const res = await fetch("http://localhost:8886/mod.ts");
      assertEquals(
        await res.text(),
        await transpile(
          await Deno.readTextFile(new URL("./mod.ts", import.meta.url)),
          new URL("file:///src.ts"),
        ),
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
        await transpile(
          await Deno.readTextFile(new URL("./test/a.tsx", import.meta.url)),
          new URL("file:///src.tsx"),
        ),
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
        await transpile(
          await Deno.readTextFile(new URL("./test/a.jsx", import.meta.url)),
          new URL("file:///src.jsx"),
        ),
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
  name: "file server - serveDirWithTs",
  async fn() {
    const controller = new AbortController();
    const serverPromise = serve((request) => serveDirWithTs(request), {
      signal: controller.signal,
      port: 8887,
    });

    {
      const res = await fetch("http://localhost:8887/mod.ts");
      assertEquals(
        await res.text(),
        await transpile(
          await Deno.readTextFile(new URL("./mod.ts", import.meta.url)),
          new URL("file:///src.ts"),
        ),
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
        await transpile(
          await Deno.readTextFile(new URL("./test/a.tsx", import.meta.url)),
          new URL("file:///src.tsx"),
        ),
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
        await transpile(
          await Deno.readTextFile(new URL("./test/a.jsx", import.meta.url)),
          new URL("file:///src.jsx"),
        ),
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
