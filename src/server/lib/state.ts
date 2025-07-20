import z from "zod";

export const TranscriptSchema = z.object({
    speakerName: z.string(),
    text: z.string(),
    relativeStartTime: z.number(),
});
export type Transcript = z.infer<typeof TranscriptSchema>;

export const StateSchema = z.object({
    permissions_granted: z.boolean(),
    meeting: z.record(z.string(), z.any()).nullish(),
    isRecording: z.boolean(),
    recording: z.record(z.string(), z.any()).nullish(),
    videoUrl: z.string().nullish(),
    transcript: TranscriptSchema.array().default([]),
    summary: z.string().nullish(),
});

export type State = z.infer<typeof StateSchema>;

export const InitialStateValue: State = {
    permissions_granted: false,
    isRecording: false,
    meeting: null,
    recording: null,
    transcript: [],
    videoUrl: null,
    summary: null,
}

