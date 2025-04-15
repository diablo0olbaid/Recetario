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
            text: `Respondé SOLO con un JSON así:
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

    console.log("🔍 Respuesta cruda de Gemini:", raw);

    if (!response.ok) {
      return res.status(response.status).json({ error: "Error HTTP al llamar a Gemini", status: response.status });
    }

    // Intentamos parsear la primera capa
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error("❌ No se pudo hacer JSON.parse de la respuesta completa:", e);
      return res.status(500).json({ error: "Respuesta no era JSON (raw):", raw });
    }

    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!texto) {
      console.error("❌ Gemini no devolvió texto");
      return res.status(500).json({ error: "La respuesta de Gemini no contiene texto interpretable", fullResponse: data });
    }

    // Intentamos parsear la receta como JSON
    try {
      const receta = JSON.parse(texto);
      return res.status(200).json(receta);
    } catch (e) {
      console.error("❌ Error al parsear JSON de receta:", e);
      return res.status(500).json({ error: "Texto no era JSON", texto });
    }

  } catch (err) {
    console.error("🔥 Error general en el endpoint:", err);
    return res.status(500).json({ error: "Fallo al generar receta" });
  }
}
