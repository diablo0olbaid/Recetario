export default async function handler(req, res) {
  const { input } = req.query;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!input || !apiKey) {
    return res.status(400).json({ error: "Falta input o API Key" });
  }

  const prompt = `
Respondé SOLO con un JSON válido con esta estructura:
{
  "nombre": "string",
  "ingredientes": ["..."],
  "pasos": ["..."]
}
No incluyas explicaciones, saludos ni introducciones.
Tu única respuesta debe ser el JSON. Pedido del usuario: "${input}"
`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct", // Podés cambiarlo por otro si querés
        messages: [
          { role: "user", content: prompt }
        ]
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
