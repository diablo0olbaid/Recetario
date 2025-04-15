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
    console.log("📦 Respuesta RAW:", raw);

    if (!response.ok) {
      console.error("❌ Gemini respondió con error HTTP:", response.status);
      return res.status(response.status).json({ error: "Error HTTP al llamar a PaLM", status: response.status });
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error("❌ Error al parsear JSON completo:", e);
      return res.status(500).json({ error: "Respuesta no era JSON", raw });
    }

    const texto = data.candidates?.[0]?.content;

    if (!texto) {
      console.error("❌ No se recibió texto en la respuesta:", data);
      return res.status(500).json({ error: "La respuesta no contiene texto interpretable" });
    }

    try {
      const receta = JSON.parse(texto);
      return res.status(200).json(receta);
    } catch (e) {
      console.error("❌ Texto no era JSON válido:", texto);
      return res.status(500).json({ error: "Texto no era JSON válido", texto });
    }

  } catch (err) {
    console.error("🔥 Error general en el endpoint:", err);
    return res.status(500).json({ error: "Fallo al generar receta" });
  }
}
