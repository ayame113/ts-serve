import { serveDirWithTs } from "../mod.ts";
Deno.serve((req) => serveDirWithTs(req, { fsRoot: "example" }));
