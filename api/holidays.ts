import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const COUNTRY = process.env.COUNTRY || 'PL';
    const API_KEY = process.env.API_KEY;

    const response = await fetch(`https://api.api-ninjas.com/v1/holidays?country=${COUNTRY}`, {
      headers: { 'X-Api-Key': API_KEY || '' }
    });

    if (!response.ok) throw new Error('Failed to fetch holidays');

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch holidays' });
  }
}