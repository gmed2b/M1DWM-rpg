import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import auth from "@/routes/auth/auth.index";
import index from "@/routes/index.route";
import users from "@/routes/users/users.index";

const app = createApp();

configureOpenAPI(app);

const routes = [
  index,
  auth,
  users,
] as const;

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = typeof routes[number];

export default app;
