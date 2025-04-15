export default async function handler(req, res) {
  const { input } = req.query;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!input || !apiKey) {
    return res.status(400).json({ error: "Falta input o API Key" });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openchat/openchat-7b", // Podés cambiarlo por "mistralai/mixtral-8x7b" o "openai/gpt-3.5-turbo"
        messages: [
          {
            role: "user",
            content: `Quiero una receta en formato JSON con este formato:
{
  "nombre": "...",
  "ingredientes": ["..."],
  "pasos": ["..."]
}
Pedido del usuario: ${input}`
          }
        ]
      })
    });

    const data = await response.json();
    const texto = data.choices?.[0]?.message?.content;

    if (!texto) {
      return res.status(500).json({ error: "Sin contenido en la respuesta", raw: data });
    }

    try {
      const receta = JSON.parse(texto);
      return res.status(200).json(receta);
    } catch {
      return res.status(200).json({ textoPlano: texto, nota: "No era JSON válido, pero lo devolvemos igual como texto." });
    }

  } catch (err) {
    console.error("❌ Error al llamar a OpenRouter:", err);
    return res.status(500).json({ error: "Fallo al generar receta", details: err.message });
  }
}
