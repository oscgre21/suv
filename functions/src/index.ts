import {onRequest} from "firebase-functions/v2/https/onRequest";
import next from "next";

const dev = false;
const app = next({
  dev,
  conf: { distDir: ".next" }
});
const handle = app.getRequestHandler();

export const nextServer = onRequest(
  {
    region: "us-central1",
    memory: "1GiB",
    timeoutSeconds: 60,
  },
  async (req, res) => {
    await app.prepare();
    return handle(req, res);
  }
);
