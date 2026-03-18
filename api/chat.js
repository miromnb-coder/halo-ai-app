let chats = {};

export default async function handler(req, res) {
  try {
    const { message, userId = "default" } = req.body;

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "API key puuttuu" });
    }

    if (!chats[userId]) chats[userId] = [];

    chats[userId].push({ role: "user", content: message });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: chats[userId]
      })
    });

    const data = await response.json();

    const reply = data.choices?.[0]?.message?.content || "Ei vastausta";

    chats[userId].push({ role: "assistant", content: reply });

    res.status(200).json({ reply });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
