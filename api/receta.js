export default async function handler(req, res) {
  const { input } = req.query;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!input || !apiKey) {
    return res.status(400).json({ error: "Falta input o API Key" });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/chat-bison-001:generateMessage?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: {
          text: `Respondé SOLO con un JSON así:
{
  "nombre": "...",
  "ingredientes": ["..."],
  "pasos": ["..."]
}
No agregues explicaciones. Pedido del usuario: "${input}"`
        },
        temperature: 0.7
      })
    });

    const raw = await response.text();
    console.log("📦 RAW:", raw);

    if (!response.ok) {
      return res.status(response.status).json({ error: "Error HTTP", status: response.status });
    }

    const data = JSON.parse(raw);
    const texto = data.candidates?.[0]?.content;

    if (!texto) {
      return res.status(500).json({ error: "Sin contenido en respuesta", raw });
    }

    try {
      const receta = JSON.parse(texto);
      return res.status(200).json(receta);
    } catch (e) {
      return res.status(500).json({ error: "El contenido no es JSON válido", texto });
    }

  } catch (err) {
    console.error("🔥 Error general:", err);
    return res.status(500).json({ error: "Fallo al generar receta" });
  }
}
