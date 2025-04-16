export default async function handler(req, res) {
  try {
    const input = req.query.input;

    if (!input) {
      return res.status(400).json({ error: "Falta el input" });
    }

    const response = await fetch(
      `https://recetario-ffv9c6zr4-gastons-projects-b2e4ce12.vercel.app/api/receta?input=${encodeURIComponent(input)}`
    );

    if (!response.ok) {
      return res.status(500).json({ error: "Error en la llamada al endpoint original", status: response.status });
    }

    const json = await response.json();
    return res.status(200).json(json);
  } catch (e) {
    return res.status(500).json({ error: "Fallo general en proxy", detalle: e.message });
  }
}
