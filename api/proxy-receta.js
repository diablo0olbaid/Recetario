export default async function handler(req, res) {
  const { input } = req.query;

  if (!input) {
    return res.status(400).json({ error: "Falta input" });
  }

  try {
    const response = await fetch(`https://recetario-ffv9c6zr4-gastons-projects-b2e4ce12.vercel.app/api/receta?input=${encodeURIComponent(input)}`);
    
    if (!response.ok) {
      throw new Error(`Respuesta no OK desde /receta: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (err) {
    console.error("Error desde el proxy:", err);
    res.status(500).json({ error: "Fallo al generar receta desde el proxy" });
  }
}
