let chats = {};

export default async function handler(req, res) {
  try {
    const { message, userId = "default" } = req.body;

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ reply: "API key puuttuu" });
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
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: `
Olet Halo AI.
Vastaa aina suomeksi.
Ole hyödyllinen ja selkeä.
`
          },
          ...chats[userId]
        ]
      })
    });

    const data = await response.json();

    console.log("AI RAW:", JSON.stringify(data));

    // 🔥 SUPER VARMA PARSING
    let reply = null;

    if (data?.choices?.[0]?.message?.content) {
      reply = data.choices[0].message.content;
    } else if (data?.choices?.[0]?.text) {
      reply = data.choices[0].text;
    } else if (typeof data === "string") {
      reply = data;
    }

    // 🔥 jos ei tullut mitään → fallback vastaus
    if (!reply) {
      reply = "Hmm… en saanut vastausta AI:lta. Kokeile uudestaan.";
    }

    chats[userId].push({ role: "assistant", content: reply });

    res.status(200).json({ reply });

  } catch (err) {
    res.status(500).json({ reply: "Virhe: " + err.message });
  }
}
