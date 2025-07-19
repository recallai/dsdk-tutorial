import { env } from "../config/env";

export const getSummary = async (transcript: Record<string, string>[]) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that provides summaries of transcripts. Your summaries are always less than 400 words."
                },
                {
                    role: "user",
                    content: `Please provide a summary of the following transcript:\n\n${transcript.map(t => `${t.speakerName}: ${t.text}`).join('\n')}`
                }
            ]
        })
    });
    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
    }

    return "No summary available.";
} 