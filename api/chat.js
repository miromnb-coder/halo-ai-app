let chats = {};

export default async function handler(req, res) {
  try {
    const { message, userId = "default" } = req.body;

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "API key puuttuu" });
    }

    if (!chats[userId]) chats[userId] = [];

    // Tallenna käyttäjän viesti
    chats[userId].push({ role: "user", content: message });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct", // 🔥 parempi ilmainen malli
        messages: [
          {
            role: "system",
            content: `
Vastaa aina suomeksi.
Ole selkeä, fiksu ja hyödyllinen.
Pidä vastaukset lyhyinä mutta hyvänä.
Selitä asiat yksinkertaisesti.
Älä käytä muita kieliä.
`
          },
          ...chats[userId]
        ]
      })
    });

    const data = await response.json();

    console.log("FULL RESPONSE:", data);

    let reply =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      "En saanut vastausta.";

    // Tallenna AI vastaus
    chats[userId].push({ role: "assistant", content: reply });

    res.status(200).json({ reply });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
