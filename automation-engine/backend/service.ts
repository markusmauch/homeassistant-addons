// server.ts
import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const router = new Router();

// Middleware function to log route invocations
app.use(async (ctx, next) => {
  console.log(`[${new Date().toISOString()}] ${ctx.request.method} ${ctx.request.url}`);
  await next();
});

router.get('/hello', (ctx) => {
  ctx.response.body = 'Hello, World!';
});

router.get('/api/hello', (ctx) => {
  ctx.response.body = 'Hello, World!';
});

router.get("/api/start", async (context) => {
    try {
      // Execute the PM2 list command
      const process = Deno.run({
        cmd: ["pm2", "start", "ping", "--", "localhost"],
        stdout: "piped",
        stderr: "piped",
      });

      const [status, stdout, stderr] = await Promise.all([
        process.status(),
        process.output(),
        process.stderrOutput(),
      ]);

      process.close();

      if (status.success) {
        context.response.status = 200;
        context.response.body = new TextDecoder().decode(stdout);
      } else {
        context.response.status = 500;
        context.response.body = new TextDecoder().decode(stderr);
      }
    } catch (error) {
      console.error(error);
      context.response.status = 500;
      context.response.body = "Error getting PM2 list";
    }
  });


// Endpoint to stop PM2
router.get("/api/stop", async (context) => {
  try {
    // Execute the PM2 list command
    const process = Deno.run({
      cmd: ["pm2", "stop", "all"],
      stdout: "piped",
      stderr: "piped",
    });

    const [status, stdout, stderr] = await Promise.all([
      process.status(),
      process.output(),
      process.stderrOutput(),
    ]);

    process.close();

    if (status.success) {
      context.response.status = 200;
      context.response.body = new TextDecoder().decode(stdout);
    } else {
      context.response.status = 500;
      context.response.body = new TextDecoder().decode(stderr);
    }
  } catch (error) {
    console.error(error);
    context.response.status = 500;
    context.response.body = "Error getting PM2 list";
  }
});


router.get("/api/list", async (context) => {
  try {
    // Execute the PM2 list command
    const process = Deno.run({
      cmd: ["pm2", "list"],
      stdout: "piped",
      stderr: "piped",
    });

    const [status, stdout, stderr] = await Promise.all([
      process.status(),
      process.output(),
      process.stderrOutput(),
    ]);

    process.close();

    if (status.success) {
      context.response.status = 200;
      context.response.body = new TextDecoder().decode(stdout);
    } else {
      context.response.status = 500;
      context.response.body = new TextDecoder().decode(stderr);
    }
  } catch (error) {
    console.error(error);
    context.response.status = 500;
    context.response.body = "Error getting PM2 list";
  }
});

router.get("/:path*", async (ctx) => {
  const path = ctx.params.path || ""; // Capture the path parameter
  let newPath = path === "" ? "index.html" : path;
  const fileServerPath = `/app/frontend/public/${newPath}`;

  try {
    await Deno.stat(fileServerPath);
    await send(ctx, newPath, { root: "/app/frontend/public" });
  } catch (error) {
    // If the path doesn't exist, you can handle it as needed
    ctx.response.status = 404;
    ctx.response.body = 'Not Found';
  }
});

// router.get('/', async (ctx) => {
//   // Serve the static file
//   await send(ctx, ctx.request.url.pathname, {
//     root: `/app/frontend/public`,
//     index: "index.html",
//   });
// });

app.use(router.routes());
app.use(router.allowedMethods());

console.log('Server is running on http://localhost:8099');

await app.listen({ port: 8099 });
