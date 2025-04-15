// Middleware para habilitar CORS
const allowCors = (handler) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Cambiá "*" por "https://www.carrefour.com.ar" si necesitás restringirlo
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return handler(req, res);
};

// Función principal
const handler = async (req, res) => {
  const { input } = req.query;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!input || !apiKey) {
    return res.status(400).json({ error: 'Falta input o API Key' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "openchat/openchat-3.5-0106",
        messages: [
          {
            role: "system",
            content: `Sos un asistente que responde EXCLUSIVAMENTE con un JSON con esta estructura:\n{\n"nombre": "...",\n"ingredientes": ["...", "..."],\n"pasos": ["...", "..."]\n}\nNO agregues texto fuera del JSON. No lo expliques.`
          },
          {
            role: "user",
            content: `Quiero hacer: ${input}`
          }
        ]
      })
    });

    const data = await response.json();
    const texto = data.choices?.[0]?.message?.content;

    const receta = JSON.parse(texto);
    res.status(200).json(receta);
  } catch (err) {
    console.error('Error en el endpoint:', err);
    res.status(500).json({ error: 'Fallo al generar receta' });
  }
};

export default allowCors(handler);
