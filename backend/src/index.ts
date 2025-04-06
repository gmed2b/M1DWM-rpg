import app from "./app";
import env from "./env";

const port = env.PORT;

export default {
  fetch: app.fetch,
  port,
};
