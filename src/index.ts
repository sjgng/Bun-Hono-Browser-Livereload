import { Hono } from "hono";
import { htmlLiveReload } from "../browser-hot-reload";

const app = new Hono();

const IS_PROD = process.env.NODE_ENV === "production";

app.get("/", (c) => {
  return c.html(`
  <html>
    <head>
      <title>My Page</title>
    </head>
    <body>
      <h1>Hello, World!</h1>
    </body>
  </html>
`);
});

export default {
  port: 2137,
  fetch: IS_PROD ? app.fetch : htmlLiveReload(app.fetch),
};
