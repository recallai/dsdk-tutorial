import z from "zod";
import { Transcript } from "../../StateSchema";

export const RecallAiTranscriptSchema = z.object({
    participant: z.object({
        name: z.string().nullish(),
    }),
    words: z.array(z.object({
        text: z.string(),
        start_timestamp: z.object({
            relative: z.number(),
            absolute: z.string(),
        })
    })),
}).array();

export const parseTranscript = async (downloadUrl: string): Promise<Transcript[]> => {
    const response = await fetch(downloadUrl);
    const data = RecallAiTranscriptSchema.parse(await response.json());

    return formatRecallAiTranscript(data);
}

export const formatRecallAiTranscript = (data: z.infer<typeof RecallAiTranscriptSchema>): Transcript[] => {
    if (!data || data.length === 0) {
        return [];
    }

    const utterances = data.reduce((acc, part) => {
        // If empty, add the first part
        if (acc.length === 0) {
            acc.push(part);
        }
        // If the last part is the same speaker, add the words to the last part
        else if (acc[acc.length - 1].participant.name === part.participant.name) {
            acc[acc.length - 1].words.push(...part.words);
        }
        // If this is a different speaker, add the part to the array
        else {
            acc.push(part);
        }
        return acc;
    }, [] as typeof data)

    const finalParts = utterances.map((part) => ({
        speakerName: part.participant.name || 'Unknown',
        text: part.words.map((word) => word.text).join(' '),
        relativeStartTime: part.words[0].start_timestamp.relative,
    }));

    return finalParts;
}