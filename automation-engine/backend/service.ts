// server.ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const router = new Router();

router.get('/hello', (ctx) => {
  ctx.response.body = 'Hello, World!';
});

router.get('/api/hello', (ctx) => {
  ctx.response.body = 'Hello, World!';
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log('Server is running on http://localhost:8098');

await app.listen({ port: 8098 });
