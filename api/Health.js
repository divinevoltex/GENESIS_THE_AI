export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.json({ 
    status: "healthy", 
    message: "Hey Duce! All systems go! 🚀✨",
    hasApiKey: !!process.env.OPENROUTER_API_KEY,
    timestamp: new Date().toISOString()
  });
}
