import { createRouter } from "@/lib/create-app";

import * as handlers from "./heroes.handlers";
import * as routes from "./heroes.routes";

const router = createRouter()
  .openapi(routes.createHero, handlers.createHero)
  .openapi(routes.getHeroes, handlers.getHeroes)
  .openapi(routes.getHero, handlers.getHero)
  .openapi(routes.updateHero, handlers.updateHero)
  .openapi(routes.setActiveHero, handlers.setActiveHero)
  .openapi(routes.deleteHero, handlers.deleteHero);

export default router;
