export default async function handler(req, res) {
  const { input } = req.query;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!input || !apiKey) {
    return res.status(400).json({ error: "Falta input o API Key" });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/chat-bison-001:generateMessage?key=${apiKey}`;
    console.log("➡️ Haciendo fetch a:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: {
          messages: [
            {
              author: "user",
              content: `Respondé SOLO con un JSON así:
{
  "nombre": "...",
  "ingredientes": ["..."],
  "pasos": ["..."]
}
No agregues explicaciones. Pedido del usuario: "${input}"`
            }
          ]
        },
        temperature: 0.7
      })
    });

    const raw = await response.text();
    console.log("📦 Respuesta cruda:", raw);

    if (!response.ok) {
      return res.status(response.status).json({ error: "Error HTTP al llamar a PaLM", status: response.status });
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error("❌ Error al parsear JSON completo:", e);
      return res.status(500).json({ error: "Respuesta no era JSON", raw });
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error("❌ Estructura inesperada:", data);
      return res.status(500).json({ error: "Respuesta inesperada de PaLM", data });
    }

    const texto = data.candidates[0].content;

    try {
      const receta = JSON.parse(texto);
      return res.status(200).json(receta);
    } catch (e) {
      console.error("❌ Error al parsear JSON de receta:", e);
      return res.status(500).json({ error: "Texto no era JSON válido", texto });
    }

  } catch (err) {
    console.error("🔥 Error general en el endpoint:", err);
    return res.status(500).json({ error: "Fallo al generar receta" });
  }
}
