import { routeAgentRequest } from "agents";
import { ProdigiAgent } from "./agent";

export { ProdigiAgent };

export default {
  async fetch(request, env, ctx) {
    // Route to agent (Durable Object)
    return (await routeAgentRequest(request, env)) || new Response("Not found", { status: 404 });
  },
};
