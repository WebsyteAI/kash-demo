import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { OpenAI } from 'openai';
import Stripe from 'stripe';
import sgMail from '@sendgrid/mail';

interface Env {
  AI: Fetcher;
  USER_DATA: KVNamespace;
  PRODIGI_API_KEY: string;
  STRIPE_API_KEY: string;
  SENDGRID_API_KEY: string;
  APP_URL: string;
}

const app = new Hono<{ Bindings: Env }>();

// Enable CORS
app.use('*', cors());

// Initialize Stripe and SendGrid
app.use('*', async (c, next) => {
  const stripe = new Stripe(c.env.STRIPE_API_KEY, { apiVersion: '2022-11-15' });
  sgMail.setApiKey(c.env.SENDGRID_API_KEY);
  c.set('stripe', stripe);
  await next();
});

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

    return c.json({ imageUrl: response.data[0].url });
  } catch (error) {
    console.error('AI Image Generation Error:', error);
    return c.json({ error: 'Failed to generate image' }, 500);
  }
});

// Fetch Prodigi Product Catalog
app.get('/products', async (c) => {
  try {
    const response = await fetch('https://api.prodigi.com/v4.0/products', {
      headers: { Authorization: `Bearer ${c.env.PRODIGI_API_KEY}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product catalog');
    }

    const products = await response.json();
    return c.json(products);
  } catch (error) {
    console.error('Prodigi API Error:', error);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

// Placeholder for additional routes (e.g., user accounts, checkout, etc.)

export default app;