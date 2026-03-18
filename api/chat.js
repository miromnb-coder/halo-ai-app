export default async function handler(req, res) {
  try {
    const { message } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openchat/openchat-7b", // 🔥 VAIHDETTU TÄHÄN
        messages: [
          {
            role: "system",
            content: "Vastaa aina suomeksi."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    console.log("FULL:", data);

    if (data.error) {
      return res.status(200).json({
        reply: "AI virhe: " + data.error.message
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "AI ei vastannut.";

    res.status(200).json({ reply });

  } catch (err) {
    res.status(500).json({
      reply: "Server error: " + err.message
    });
  }
}
