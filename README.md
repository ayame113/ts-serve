# ts-serve

[![Test](https://github.com/ayame113/ts-serve/actions/workflows/test.yml/badge.svg)](https://github.com/ayame113/ts-serve/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/ayame113/ts-serve/branch/main/graph/badge.svg?token=mz0SfmUYRL)](https://codecov.io/gh/ayame113/ts-serve)

TypeScript + ES Modules

Transpile TypeScript on the fly and serve it from your server as ES Modules.

```ts
import { serve } from "https://deno.land/std@0.153.0/http/mod.ts";
import { serveDirWithTs } from "https://deno.land/x/ts_serve@$VERSION/mod.ts";

serve((request) => serveDirWithTs(request));
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

```ts
import { Application } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { tsMiddleware } from "https://deno.land/x/ts_serve@$VERSION/mod.ts";

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
[serveDir](https://doc.deno.land/https://deno.land/std@0.153.0/http/file_server.ts/~/serveDir)
function in the Deno standard library:

```ts
import { serve } from "https://deno.land/std@0.153.0/http/mod.ts";
import { serveDirWithTs } from "https://deno.land/x/ts_serve@$VERSION/mod.ts";

serve((request) => serveDirWithTs(request));
```

As a replacement for the
[serveFile](https://doc.deno.land/https://deno.land/std@0.153.0/http/file_server.ts/~/serveFile)
function in the Deno standard library:

```ts
import { serve } from "https://deno.land/std@0.153.0/http/mod.ts";
import { serveFileWithTs } from "https://deno.land/x/ts_serve@$VERSION/mod.ts";

serve((request) => serveFileWithTs(request, "./mod.ts"));
```

As [Hono](https://honojs.dev/)'s handler:

```ts
import { serve } from "https://deno.land/std@0.159.0/http/server.ts";
import { Hono } from "https://deno.land/x/hono@v2.2.5/mod.ts";
import { serveDirWithTs } from "https://deno.land/x/ts_serve@$VERSION/mod.ts";

const app = new Hono();
app.get("*", (c) => {
  return serveDirWithTs(c.req);
});
serve(app.fetch);
```

### fourceInstantiateWasm function

Optionally, calling the `fourceInstantiateWasm` function before starting the
server will force the wasm file to be read ahead. Otherwise the wasm file will
take about 3 seconds to load the first time it is transpiled.

```ts
import { serve } from "https://deno.land/std@0.153.0/http/mod.ts";
import {
  fourceInstantiateWasm,
  serveDirWithTs,
} from "https://deno.land/x/ts_serve@$VERSION/mod.ts";

fourceInstantiateWasm();
serve((request) => serveDirWithTs(request));
```

## develop

```shell
> deno task test
```
