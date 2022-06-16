# ts-serve

TypeScript + ES Modules

Transpile TypeScript on the fly and deliver it from your server as ES Modules.

```ts
import { serve } from "https://deno.land/std@0.144.0/http/mod.ts";
import { serveDirWithTs } from "https://deno.land/x/ts_serve@$VERSION/mod.ts";

serve((request) => serveDirWithTs(request));
```

```tsx ignore
// index.html
<script src="./main.ts" type="module"></script>;

// main.ts
console.log(1);
```

- The URL remains `*.ts` and will not be rewritten. That is, `import "./foo.ts"`
  and `<script src="./foo.ts" type="module">` work.
- You can use `import "./foo.ts"`, which has the same syntax as Deno. This means
  that you can use the completion and diagnostic features by installing Deno and
  the Deno extension in the editor.

## Usage

As oak middleware:

```ts
import { Application } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { tsMiddleware } from "https://deno.land/x/ts_serve@$VERSION/mod.ts";

const app = new Application();
app.use(tsMiddleware); // use middleware and transpile TS code.

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
[serveDir](https://doc.deno.land/https://deno.land/std@0.144.0/http/file_server.ts/~/serveDir)
function in the Deno standard library:

```ts
import { serve } from "https://deno.land/std@0.144.0/http/mod.ts";
import { serveDirWithTs } from "https://deno.land/x/ts_serve@$VERSION/mod.ts";

serve((request) => serveDirWithTs(request));
```

As a replacement for the
[serveFile](https://doc.deno.land/https://deno.land/std@0.144.0/http/file_server.ts/~/serveFile)
function in the Deno standard library:

```ts
import { serve } from "https://deno.land/std@0.144.0/http/mod.ts";
import { serveFileWithTs } from "https://deno.land/x/ts_serve@$VERSION/mod.ts";

serve((request) => serveFileWithTs(request, "./mod.ts"));
```
