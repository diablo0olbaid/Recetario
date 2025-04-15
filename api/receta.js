export default async function handler(req, res) {
  // ✅ Habilitar CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ⬇️ A partir de acá va todo lo que ya tenías 👇
  const { input } = req.query;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!input || !apiKey) {
    return res.status(400).json({ error: "Falta input o API Key" });
  }

  const prompt = `
Respondé ÚNICAMENTE con un JSON válido con esta estructura exacta:

{
  "nombre": "string",
  "ingredientes": ["string", "string", ...],
  "pasos": ["string", "string", ...]
}

No agregues explicaciones ni encabezados. No uses texto fuera del JSON. Solo quiero un JSON puro.

Ejemplo válido:
{
  "nombre": "Arroz con pollo",
  "ingredientes": ["arroz", "pollo", "cebolla"],
  "pasos": ["Hervir arroz", "Saltear pollo", "Mezclar"]
}

Pedido del usuario: "${input}"
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const texto = data.choices?.[0]?.message?.content;

    let receta;
    try {
      receta = JSON.parse(texto);
    } catch (e) {
      receta = { textoPlano: texto, nota: "No era JSON válido, pero se devuelve igual." };
    }

    res.status(200).json(receta);

  } catch (err) {
    console.error("Error en el endpoint:", err);
    res.status(500).json({ error: "Fallo al generar receta", details: err.message });
  }
}
