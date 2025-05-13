const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

export async function testOpenAiConnection() {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Nutze GPT-3.5 für einen schnellen Test
        messages: [{ role: "user", content: "Sag einfach nur 'Hallo Welt!'" }],
        max_tokens: 50,
      }),
    });

    const data = await response.json();
    console.log("OpenAI API Antwort:", data);

    if (data.choices && data.choices[0]) {
      alert(`Verbindung erfolgreich! Antwort: ${data.choices[0].message.content}`);
    } else {
      alert("Verbindung fehlgeschlagen. Prüfe den API Key.");
    }
  } catch (error) {
    console.error("API Fehler:", error);
    alert("Fehler bei der Verbindung zur OpenAI API.");
  }
}
