const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

export async function analyzeEntry(userInput) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo", // Du kannst auch "gpt-3.5-turbo" verwenden, falls günstiger
      messages: [
        {
          role: "system",
          content: `Du bist ein professioneller Psychologe, spezialisiert auf kognitive Verhaltenstherapie (CBT). 
Analysiere den folgenden Text nach diesen Punkten:
1. Kurze Zusammenfassung (2-3 Sätze)
2. Vorherrschende Emotion(en)
3. Erkannte kognitive Verzerrungen (falls vorhanden)
4. Eine kraftvolle Reflexionsfrage für den Nutzer
5. Eine konkrete Handlungsempfehlung für heute

Antwort bitte ausschließlich in gut formatiertem Klartext auf Deutsch.`,
        },
        { role: "user", content: userInput },
      ],
      max_tokens: 800,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
