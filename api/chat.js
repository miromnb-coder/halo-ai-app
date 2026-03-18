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

Luo pieni toimiva mobiilisovellus.
Palauta VAIN HTML + CSS + JS.
EI selityksiä.
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

    console.log("DEEPSEEK FULL:", data);

    // 🔥 PARSING FIX
    let reply = null;

    if (data?.choices?.[0]?.message?.content) {
      reply = data.choices[0].message.content;
    }

    // 🔥 jos API antaa virheen → näytä se
    if (data?.error) {
      reply = "<div>❌ AI virhe: " + data.error.message + "</div>";
    }

    // 🔥 fallback ettei hajoa
    if (!reply) {
      reply = `
<div style="padding:20px;font-family:sans-serif">
<h3>⚠️ AI ei vastannut</h3>
<p>Tarkista:</p>
<ul>
<li>API key oikein</li>
<li>Vercel redeploy tehty</li>
<li>DeepSeek toimii</li>
</ul>
</div>
`;
    }

    res.status(200).json({ reply });

  } catch (err) {
    res.status(500).json({
      reply: "<div>Server error: " + err.message + "</div>"
    });
  }
}
