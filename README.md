# This module was move to jsr.

# Please see [jsr.io/@ayame113/ts-serve](https://jsr.io/@ayame113/ts-serve)

# ts-serve

[![Test](https://github.com/ayame113/ts-serve/actions/workflows/test.yml/badge.svg)](https://github.com/ayame113/ts-serve/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/ayame113/ts-serve/branch/main/graph/badge.svg?token=mz0SfmUYRL)](https://codecov.io/gh/ayame113/ts-serve)

TypeScript + ES Modules

Transpile TypeScript on the fly and serve it from your server as ES Modules.

```ts ignore
import { serveDirWithTs } from "@ayame113/ts-serve";

Deno.serve((request) => serveDirWithTs(request));
```

```tsx ignore
// index.html
<script src="./main.ts" type="module"></script>;

// main.ts
console.log(1);
```

- Supports ts, tsx and jsx transpiling.
- The URL remains `*.ts` and will not be rewritten. That is, `import "./foo.ts"`
  and `<script src="./foo.ts" type="module">` work on browser.
- You can use `import "./foo.ts"`, which has the same syntax as Deno. This means
  that you can use the completion and diagnostic features for frontend code by
  installing the Deno and Deno extensions in your editor.

## Usage

As oak middleware:

```ts ignore
import { Application } from "@oak/oak";
import { tsMiddleware } from "@ayame113/ts-serve";

const app = new Application();

// use middleware and transpile TS code
app.use(tsMiddleware);

// serve static file
app.use(async (ctx, next) => {
  try {
    await ctx.send({ root: "./" });
  } catch {
    await next();
  }
});
await app.listen({ port: 8000 });
```

As a replacement for the
[serveDir](https://doc.deno.land/https://deno.land/std@0.178.0/http/file_server.ts/~/serveDir)
function in the Deno standard library:

```ts ignore
import { serveDirWithTs } from "@ayame113/ts-serve";

Deno.serve((request) => serveDirWithTs(request));
```

As a replacement for the
[serveFile](https://doc.deno.land/https://deno.land/std@0.178.0/http/file_server.ts/~/serveFile)
function in the Deno standard library:

```ts ignore
import { serveFileWithTs } from "@ayame113/ts-serve";

Deno.serve((request) => serveFileWithTs(request, "./mod.ts"));
```

As [Hono](https://honojs.dev/)'s handler:

```ts ignore
import { Hono } from "@hono/hono";
import { serveDirWithTs } from "@ayame113/ts-serve";

const app = new Hono();
app.get("*", (c) => {
  return serveDirWithTs(c.req.raw);
});
Deno.serve(app.fetch);
```

#### `forceInstantiateWasm` function

Calling this function will load the wasm file used in the deno_emit of the
dependency. Even if you don't call this function, if you call the transpile
function, the wasm file will be read automatically at that timing.

However, performance can be an issue on the server as loading the wasm file
takes time. In that case, calling this function in advance can speed up later
calls to the transpile function.

```ts ignore
import { forceInstantiateWasm, serveDirWithTs } from "@ayame113/ts-serve";

// load the wasm file in the background when the server starts.
forceInstantiateWasm();
Deno.serve((request) => serveDirWithTs(request));
```

## develop

```shell
> deno task test
```
