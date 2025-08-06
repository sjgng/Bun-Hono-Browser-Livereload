import { watch } from "fs";
import { join } from "path";

declare global {
  var client: ReadableStreamDefaultController<string> | undefined;
}

type Fetch = (req: Request) => Promise<Response> | Response;

const LIVE_RELOAD_ENDPOINT = "/__live_reload";
const liveReloadScript = `
  <script>
    new EventSource("${LIVE_RELOAD_ENDPOINT}")
      .onmessage = () => location.reload();
  </script>
`;

const srcDir = join(process.cwd(), "src");
watch(srcDir, { recursive: true }, (_event, _filename) => {
  if (!globalThis.client) return;
  try {
    globalThis.client.enqueue("data: update\n\n");
  } catch {
    globalThis.client = undefined;
  }
});

export function htmlLiveReload(handler: Fetch): Fetch {
  return async (req) => {
    const url = new URL(req.url);

    if (url.pathname === LIVE_RELOAD_ENDPOINT) {
      const stream = new ReadableStream<string>({
        start(controller) {
          globalThis.client = controller;
        },
        cancel() {
          globalThis.client = undefined;
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    }

    const res = await handler(req);

    const ct = res.headers.get("Content-Type") ?? "";
    if (!ct.includes("text/html")) return res;

    const body = await res.text();
    const injected = body.replace("</body>", liveReloadScript + "</body>");

    return new Response(injected, {
      status: res.status,
      headers: { "Content-Type": "text/html" },
    });
  };
}
