import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { OpenAI } from 'openai';

interface Env {
  AI: Fetcher;
  PRODIGI_API_KEY: string;
}

const app = new Hono<{ Bindings: Env }>();

// Enable CORS
app.use('*', cors());

// AI Image Generation Endpoint
app.post('/generate-image', async (c) => {
  const { prompt } = await c.req.json();
  const ai = new OpenAI({ apiKey: c.env.AI });

  try {
    const response = await ai.images.generate({
      prompt,
      n: 1,
      size: '1024x1024',
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No image generated');
    }

    return c.json({ imageUrl: response.data[0].url });
  } catch (error) {
    console.error('AI Image Generation Error:', error);
    return c.json({ error: 'Failed to generate image', details: error.message }, 500);
  }
});

// Fetch Prodigi Product Catalog
app.get('/products', async (c) => {
  try {
    const response = await fetch('https://api.prodigi.com/v4.0/products', {
      headers: { Authorization: `Bearer ${c.env.PRODIGI_API_KEY}` },
    });

    if (!response.ok) {
      throw new Error(`Prodigi API Error: ${response.statusText}`);
    }

    const products = await response.json();
    return c.json(products);
  } catch (error) {
    console.error('Prodigi API Error:', error);
    return c.json({ error: 'Failed to fetch products', details: error.message }, 500);
  }
});

export default app;