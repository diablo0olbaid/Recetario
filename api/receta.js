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

    const raw = await response.text();

    // 🔍 Mostramos la respuesta cruda para debug
    console.log("➡️ Respuesta cruda de Gemini:");
    console.log(raw);

    if (!response.ok) {
      return res.status(response.status).json({ error: "Gemini respondió con error", status: response.status });
    }

    // 🔧 Intentamos parsear texto a JSON
    try {
      const data = JSON.parse(raw);
      const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const receta = JSON.parse(texto);
      return res.status(200).json(receta);
    } catch (e) {
      console.error("❌ Error al parsear JSON de Gemini:", e);
      return res.status(500).json({ error: "Respuesta no interpretable como receta JSON" });
    }

  } catch (err) {
    console.error("🔥 Error general en el endpoint:", err);
    return res.status(500).json({ error: "Fallo al generar receta" });
  }
}
