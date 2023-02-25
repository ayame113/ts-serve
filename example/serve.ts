import { serve } from "https://deno.land/std@0.178.0/http/mod.ts";
import { serveDirWithTs } from "../mod.ts";
serve((req) => serveDirWithTs(req, { fsRoot: "example" }));
