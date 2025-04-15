import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("TU_API_KEY");

export default async function handler(req, res) {
  const { input } = req.query;

  if (!input) {
    return res.status(400).json({ error: "Falta input" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "chat-bison-001" });

    const result = await model.generateContent([
      {
        role: "user",
        parts: [
          {
            text: `Respondé SOLO con un JSON así:
{
  "nombre": "...",
  "ingredientes": ["..."],
  "pasos": ["..."]
}
No agregues explicaciones. Pedido del usuario: ${input}`
          }
        ]
      }
    ]);

    const responseText = result.response.text();
    const receta = JSON.parse(responseText);

    return res.status(200).json(receta);
  } catch (error) {
    console.error("❌ Error al generar receta:", error);
    return res.status(500).json({ error: "Fallo al generar receta", details: error.message });
  }
}
