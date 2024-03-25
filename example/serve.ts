import { serve } from "https://deno.land/std@0.220.1/http/mod.ts";
import { serveDirWithTs } from "../mod.ts";
serve((req) => serveDirWithTs(req, { fsRoot: "example" }));
