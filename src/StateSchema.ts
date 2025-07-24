import z from "zod";

export const TranscriptSchema = z.object({
    speakerName: z.string(),
    text: z.string(),
    relativeStartTime: z.number(),
});
export type Transcript = z.infer<typeof TranscriptSchema>;

export const StateSchema = z.object({
    permissionsGranted: z.boolean().nullish(),
    isRecording: z.boolean().nullish(),
    windowId: z.string().nullish(),
    sdkUpload: z.record(z.string(), z.any()).nullish(),
    recording: z.record(z.string(), z.any()).nullish(),
    videoUrl: z.string().nullish(),
    transcript: TranscriptSchema.array().default([]),
    summary: z.string().nullish(),
});

export type State = z.infer<typeof StateSchema>;

export const InitialStateValue: State = {
    permissionsGranted: false,
    isRecording: false,
    windowId: null,
    sdkUpload: null,
    recording: null,
    transcript: [],
    videoUrl: null,
    summary: null,
}

