export default async function handler(req, res) {
  try {
    const { message } = req.body;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `
Olet AI App Builder.

Kun käyttäjä antaa idean:
- luo pieni toimiva sovellus
- käytä HTML + CSS + JavaScript
- tee moderni UI
- tee mobiiliystävällinen
- EI selityksiä
- PALAUTA VAIN KOODI
`
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "<div>Virhe appin luomisessa</div>";

    res.status(200).json({ reply });

  } catch (err) {
    res.status(500).json({
      reply: "<div>Server error</div>"
    });
  }
}
