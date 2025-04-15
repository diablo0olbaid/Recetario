export default async function handler(req, res) {
  const { input } = req.query;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!input || !apiKey) {
    return res.status(400).json({ error: "Falta input o API Key" });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Respondé SOLO con un JSON con esta estructura:
{
  "nombre": "...",
  "ingredientes": ["..."],
  "pasos": ["..."]
}
No agregues explicaciones. Pedido del usuario: "${input}"`
          }]
        }]
      })
    });

    const data = await response.json();
    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const receta = JSON.parse(texto);

    res.status(200).json(receta);
  } catch (err) {
    console.error("Error en el endpoint:", err);
    res.status(500).json({ error: "Fallo al generar receta" });
  }
}
