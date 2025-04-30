import { Agent } from "agents";

interface Env {
  PRODIGI_API_KEY: string;
}

export class ProdigiAgent extends Agent<Env> {
  // Handle HTTP requests to the agent
  async onRequest(request: Request) {
    const url = new URL(request.url);
    if (url.pathname.endsWith("/product-details")) {
      return this.getProductDetails();
    }
    return new Response("Not found", { status: 404 });
  }

  // Fetch product details for GLOBAL-CAN-10x10
  async getProductDetails() {
    try {
      const resp = await fetch(
        "https://api.sandbox.prodigi.com/v4.0/products/GLOBAL-CAN-10x10",
        {
          method: "GET",
          headers: {
            "X-API-Key": this.env.PRODIGI_API_KEY,
          },
        }
      );
      if (!resp.ok) {
        throw new Error(`Prodigi API Error: ${resp.statusText}`);
      }
      const data = await resp.json();
      return Response.json(data);
    } catch (err) {
      return Response.json({ error: "Failed to fetch product details", details: err.message }, { status: 500 });
    }
  }
}
