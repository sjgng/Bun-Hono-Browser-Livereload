# Hono + Bun Live-Reload Middleware

A zero-config, single-file browser live-reload solution for Hono apps running on Bun.
Watches your `src/` directory and automatically triggers a full browser reload via SSE whenever a file changes.

---

## ⚙️ Installation

1. **Clone or copy** this project into your codebase.

---

## 🚀 Usage

In src/index.ts, import and apply the middleware:

```
import { Hono } from "hono";
import { htmlLiveReload } from "../browser-live-reload";

const app = new Hono();

app.get("/", (c) => {
return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Live Reload Demo</title>
      </head>
      <body>
        <h1>Hello, Hono + Bun!</h1>
      </body>
    </html>`);
});

export default htmlLiveReload(app.fetch);
```

## 🔍 How It Works

1. File watcher
   On module load, fs.watch("src", { recursive: true }) listens for file changes only within the src/ directory.
2. SSE endpoint
   The middleware serves GET /\_\_live_reload as a Server-Sent Events (SSE) stream. The controller is saved to globalThis.client.
3. Client script injection
   Every HTML response gets a <script> injected before </body>:
   ```
   <script>
        new EventSource("/__live_reload")
          .onmessage = () => location.reload();
   </script>
   ```
4. Triggering reload
   When the file watcher detects a change, it sends an SSE message:
   `globalThis.client?.enqueue("data: update\n\n");`

## ⚙️ Configuration

- Watch directory
  By default, it watches /src folder. To change the directory, modify this line in browser-live-reload.ts:
  `const srcDir = join(process.cwd(), "src");`
- Endpoint path
  Default SSE path is /\_\_live_reload. You can change this by editing:
  `const LIVE_RELOAD_ENDPOINT = "/__live_reload";`

## 🚧 Caveats

- Full-page reload only. No HMR.

- Your HTML responses must include a </body> tag for script injection.

- Bun’s --hot flag is required to restart the server on code changes.
