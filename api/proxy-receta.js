export default async function handler(req, res) {
  try {
    const input = req.query.input;

    if (!input) {
      return res.status(400).json({ error: "Falta el input" });
    }

    const url = `http://localhost:3000/api/receta?input=${encodeURIComponent(input)}`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(500).json({ error: "Error en llamada interna", status: response.status });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Fallo general en proxy", detalle: err.message });
  }
}
