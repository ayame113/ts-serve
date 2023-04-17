import { serve } from "https://deno.land/std@0.178.0/http/mod.ts";
import { App } from "../mod.ts";
import { tsServe } from "../middlewear/ts-serve.ts";
import { markdown } from "../middlewear/gfm.ts";
// import { webpConverter } from "../middlewear/webp.ts";
// import basicAuth from "https://deno.land/x/lume@v1.15.3/middlewares/basic_auth.ts";

const app = new App();

// middleware
app
  // .use(basicAuth({
  //   users: {
  //     "user": "pass",
  //   },
  // }))
  .use(tsServe())
  // .use(webpConverter())
  .use(markdown({
    renderOptions: { disableHtmlSanitization: true },
    frontMatter: true,
    format(body, { CSS }, frontMatter) {
      console.log(frontMatter);
      return `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              main {
                max-width: 800px;
                margin: 0 auto;
              }
              ${CSS}
            </style>
          </head>
          <body>
            <main data-color-mode="light" data-light-theme="light" data-dark-theme="dark" class="markdown-body">
              ${body}
            </main>
          </body>
        </html>
        `;
    },
  }));

serve(app.handler);
