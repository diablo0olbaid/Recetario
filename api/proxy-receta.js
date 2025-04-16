export default async function handler(req, res) {
  const input = req.query.input;
  const baseUrl = "https://recetario-ffv9c6zr4-gastons-projects-b2e4ce12.vercel.app/api/receta?input=";

  if (!input) {
    return res.status(400).json({ error: "Falta input" });
  }

  try {
    const response = await fetch(baseUrl + encodeURIComponent(input));
    const data = await response.json();

    return res.status(200).json(data);
  } catch (err) {
    console.error("Error en el proxy:", err);
    return res.status(500).json({ error: "Fallo al generar receta desde el proxy" });
  }
}
