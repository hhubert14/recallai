# Question to Video Timestamp Linking

This document details the implementation required to link generated questions to specific timestamps in the source video, allowing users to jump directly to the relevant section.

## Overview

When a user views a question, they can click a timestamp badge to seek the video player to the exact moment where that concept was discussed.

```
┌─────────────────────────────────────────────────────┐
│ Question 3 of 10                          [▶ 2:34]  │  ← Click to jump
├─────────────────────────────────────────────────────┤
│ What is the primary purpose of dependency           │
│ injection?                                          │
│                                                     │
│ ○ A) To make code run faster                        │
│ ○ B) To decouple components and improve testability │
│ ○ C) To reduce memory usage                         │
│ ○ D) To encrypt sensitive data                      │
└─────────────────────────────────────────────────────┘
```

---

## Current State

### Transcript Service

Returns plain text with no timestamp information:

```typescript
// src/clean-architecture/domain/services/video-transcript.interface.ts
export interface IVideoTranscriptService {
    get(videoId: string): Promise<string | null>;
}
```

### Question Generator

Receives plain text transcript, generates questions without any timestamp context:

```typescript
// src/clean-architecture/infrastructure/services/question-generator.service.langchain.ts
const result = await structuredLlm.invoke([{
    role: "user",
    content: `Generate questions based on:
        Title: ${title}
        Transcript: ${transcript}  // Plain text, no timestamps
        ...`
}]);
```

Schema has no timestamp field:

```typescript
z.object({
    question: z.string(),
    options: z.array(z.string()).length(4),
    correctAnswerIndex: z.number(),
    explanation: z.string(),
    // No timestamp field
})
```

### Question Entity

No timestamp field:

```typescript
// src/clean-architecture/domain/entities/question.entity.ts
class MultipleChoiceQuestionEntity {
    constructor(
        public readonly id: number,
        public readonly videoId: number,
        public readonly questionText: string,
        public readonly options: MultipleChoiceOption[],
        // No timestamp
    ) {}
}
```

### Video Player

Simple iframe embed with no programmatic control:

```typescript
// src/app/dashboard/video/[id]/VideoPlayer.tsx
<iframe
    src={`https://www.youtube.com/embed/${videoId}`}
    // No way to seek programmatically
/>
```

---

## Required Changes

### 1. Transcript Service Interface

Update to return segments with timestamps:

```typescript
// src/clean-architecture/domain/services/video-transcript.interface.ts

export interface TranscriptSegment {
    text: string;
    startTime: number;  // seconds
    endTime: number;    // seconds
}

export interface IVideoTranscriptService {
    // Option A: Return segments only (breaking change)
    get(videoId: string): Promise<TranscriptSegment[] | null>;

    // Option B: Return both (backward compatible)
    get(videoId: string): Promise<{
        fullText: string;
        segments: TranscriptSegment[];
    } | null>;
}
```

**Recommendation:** Option B for backward compatibility during migration.

### 2. Transcript Service Implementation

Find a service that provides timestamps. Options:

| Service | Timestamps | Cost | Notes |
|---------|------------|------|-------|
| YouTube Data API | Yes | Free (quota limits) | Official, requires API key |
| `youtube-transcript` npm | Yes | Free | Unofficial, may break |
| AssemblyAI | Yes | Paid | Fallback for no captions |
| Deepgram | Yes | Paid | Fallback for no captions |

Example response format from YouTube captions:

```json
[
    { "text": "Hello and welcome", "start": 0.0, "duration": 3.5 },
    { "text": "to this video", "start": 3.5, "duration": 2.1 },
    ...
]
```

### 3. Question Generator Prompt

Update the prompt to include timestamps and request them back:

```typescript
// src/clean-architecture/infrastructure/services/question-generator.service.langchain.ts

function formatTranscriptWithTimestamps(segments: TranscriptSegment[]): string {
    return segments.map(s =>
        `[${formatTime(s.startTime)} - ${formatTime(s.endTime)}] ${s.text}`
    ).join('\n');
}

// In generate():
const formattedTranscript = formatTranscriptWithTimestamps(segments);

const result = await structuredLlm.invoke([{
    role: "user",
    content: `Generate questions based on the following video:

Title: ${title}

Transcript (with timestamps):
${formattedTranscript}

For each question, identify which timestamp (in seconds) the question content is derived from.
Use the START time of the relevant segment.

... rest of prompt ...`
}]);
```

### 4. Question Generator Schema

Add timestamp to the Zod schema:

```typescript
function createQuestionsSchema(count: number) {
    return z.object({
        questions: z
            .array(
                z.object({
                    question: z.string().describe("The question text"),
                    options: z
                        .array(z.string())
                        .length(4)
                        .describe("Four possible answer options"),
                    correctAnswerIndex: z
                        .number()
                        .min(0)
                        .max(3)
                        .describe("Index of the correct answer (0-3)"),
                    explanation: z
                        .string()
                        .describe("Brief explanation of why the correct answer is right"),
                    sourceTimestamp: z
                        .number()
                        .describe("The timestamp (in seconds) where this concept is discussed in the video"),
                })
            )
            .length(count),
    });
}
```

### 5. Question Entity

Add timestamp field:

```typescript
// src/clean-architecture/domain/entities/question.entity.ts

export class MultipleChoiceQuestionEntity implements BaseQuestion {
    readonly questionType = "multiple_choice" as const;

    constructor(
        public readonly id: number,
        public readonly videoId: number,
        public readonly questionText: string,
        public readonly options: MultipleChoiceOption[],
        public readonly sourceTimestamp: number | null,  // NEW
    ) {}
}
```

### 6. Database Schema

Add column to questions table:

```sql
ALTER TABLE questions ADD COLUMN source_timestamp REAL;
```

Drizzle schema update:

```typescript
// src/drizzle/schema.ts

export const questions = pgTable("questions", {
    id: serial("id").primaryKey(),
    videoId: integer("video_id").references(() => videos.id),
    questionText: text("question_text").notNull(),
    questionType: varchar("question_type", { length: 50 }).notNull(),
    sourceTimestamp: real("source_timestamp"),  // NEW - seconds
    createdAt: timestamp("created_at").defaultNow(),
});
```

### 7. Question Repository

Update to handle new field:

```typescript
// In createMultipleChoiceQuestion:
async createMultipleChoiceQuestion(
    videoId: number,
    questionText: string,
    options: OptionInput[],
    sourceTimestamp?: number,  // NEW
): Promise<MultipleChoiceQuestionEntity>
```

### 8. Video Player - YouTube IFrame API

Replace simple iframe with YouTube IFrame Player API for seek control:

```typescript
// src/app/dashboard/video/[id]/VideoPlayer.tsx
"use client";

import { useEffect, useRef, useCallback } from "react";

interface VideoPlayerProps {
    videoId: string | null;
    title: string;
    onPlayerReady?: (seekTo: (seconds: number) => void) => void;
}

// Load YouTube IFrame API script
function loadYouTubeAPI(): Promise<void> {
    return new Promise((resolve) => {
        if (window.YT && window.YT.Player) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.body.appendChild(script);

        window.onYouTubeIframeAPIReady = () => resolve();
    });
}

export function VideoPlayer({ videoId, title, onPlayerReady }: VideoPlayerProps) {
    const playerRef = useRef<YT.Player | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const seekTo = useCallback((seconds: number) => {
        if (playerRef.current) {
            playerRef.current.seekTo(seconds, true);
            playerRef.current.playVideo();
        }
    }, []);

    useEffect(() => {
        if (!videoId) return;

        let mounted = true;

        loadYouTubeAPI().then(() => {
            if (!mounted || !containerRef.current) return;

            playerRef.current = new window.YT.Player(containerRef.current, {
                videoId,
                playerVars: {
                    autoplay: 0,
                    modestbranding: 1,
                    rel: 0,
                },
                events: {
                    onReady: () => {
                        if (onPlayerReady) {
                            onPlayerReady(seekTo);
                        }
                    },
                },
            });
        });

        return () => {
            mounted = false;
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, [videoId, onPlayerReady, seekTo]);

    if (!videoId) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <p className="text-white">Unable to load video</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative min-h-[300px] lg:min-h-[400px]">
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
}
```

TypeScript types for YouTube API:

```typescript
// src/types/youtube.d.ts
declare namespace YT {
    class Player {
        constructor(
            element: HTMLElement | string,
            options: PlayerOptions
        );
        seekTo(seconds: number, allowSeekAhead: boolean): void;
        playVideo(): void;
        pauseVideo(): void;
        destroy(): void;
    }

    interface PlayerOptions {
        videoId?: string;
        playerVars?: PlayerVars;
        events?: PlayerEvents;
    }

    interface PlayerVars {
        autoplay?: 0 | 1;
        modestbranding?: 0 | 1;
        rel?: 0 | 1;
        start?: number;
    }

    interface PlayerEvents {
        onReady?: (event: PlayerEvent) => void;
        onStateChange?: (event: PlayerEvent) => void;
    }

    interface PlayerEvent {
        target: Player;
    }
}

interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
}
```

### 9. Video Player Context

Create a context to share seek function across components:

```typescript
// src/components/providers/VideoPlayerProvider.tsx
"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface VideoPlayerContextType {
    seekTo: (seconds: number) => void;
    registerSeekFunction: (fn: (seconds: number) => void) => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | null>(null);

export function VideoPlayerProvider({ children }: { children: ReactNode }) {
    const [seekFunction, setSeekFunction] = useState<((seconds: number) => void) | null>(null);

    const registerSeekFunction = useCallback((fn: (seconds: number) => void) => {
        setSeekFunction(() => fn);
    }, []);

    const seekTo = useCallback((seconds: number) => {
        if (seekFunction) {
            seekFunction(seconds);
        }
    }, [seekFunction]);

    return (
        <VideoPlayerContext.Provider value={{ seekTo, registerSeekFunction }}>
            {children}
        </VideoPlayerContext.Provider>
    );
}

export function useVideoPlayer() {
    const context = useContext(VideoPlayerContext);
    if (!context) {
        throw new Error("useVideoPlayer must be used within VideoPlayerProvider");
    }
    return context;
}
```

### 10. Quiz Interface UI

Add timestamp badge to questions:

```typescript
// src/app/dashboard/video/[id]/QuizInterface.tsx

import { useVideoPlayer } from "@/components/providers/VideoPlayerProvider";

// Helper function
function formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// In the component:
export function QuizInterface({ questions, videoId }: QuizInterfaceProps) {
    const { seekTo } = useVideoPlayer();

    // ... existing code ...

    return (
        <div className="space-y-6">
            {/* Progress - add timestamp badge */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>
                    Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
                </span>

                {/* Timestamp badge */}
                {currentQuestion.sourceTimestamp && (
                    <button
                        onClick={() => seekTo(currentQuestion.sourceTimestamp!)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                        <span>▶</span>
                        <span>{formatTimestamp(currentQuestion.sourceTimestamp)}</span>
                    </button>
                )}

                {/* Progress bar */}
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    {/* ... */}
                </div>
            </div>

            {/* Rest of component... */}
        </div>
    );
}
```

### 11. Page Layout Integration

Wrap the page with the provider:

```typescript
// src/app/dashboard/video/[id]/page.tsx

import { VideoPlayerProvider } from "@/components/providers/VideoPlayerProvider";

export default async function VideoDetailPage({ params }: Props) {
    // ... existing data fetching ...

    return (
        <VideoPlayerProvider>
            <div className="...">
                {/* Video Player */}
                <VideoPlayer
                    videoId={youtubeVideoId}
                    title={video.title}
                    onPlayerReady={(seekTo) => {
                        // Register is handled by context
                    }}
                />

                {/* Content Tabs with Quiz */}
                <ContentTabs
                    summary={summary}
                    questions={questions}
                    flashcards={flashcards}
                    videoId={video.id}
                />
            </div>
        </VideoPlayerProvider>
    );
}
```

---

## Alternative: Simple URL-Based Approach

If you want a simpler implementation without the YouTube IFrame API, use URL parameters:

```typescript
// VideoPlayer.tsx - Simple version
interface VideoPlayerProps {
    videoId: string | null;
    title: string;
    startTime?: number;
}

export function VideoPlayer({ videoId, title, startTime }: VideoPlayerProps) {
    const src = startTime
        ? `https://www.youtube.com/embed/${videoId}?start=${Math.floor(startTime)}`
        : `https://www.youtube.com/embed/${videoId}`;

    return (
        <iframe
            key={startTime}  // Force re-render on time change
            src={src}
            title={title}
            // ...
        />
    );
}
```

**Tradeoffs:**
- Simpler implementation
- Reloads iframe on each seek (jarring UX)
- Works without additional API setup

---

## Implementation Order

1. **Transcript service** - Find/implement service with timestamps
2. **Database migration** - Add `source_timestamp` column
3. **Entity & repository** - Update to include timestamp
4. **Question generator** - Update prompt and schema
5. **Use case** - Pass timestamps through the pipeline
6. **Video player** - Implement YouTube IFrame API
7. **Context provider** - Create VideoPlayerProvider
8. **Quiz UI** - Add timestamp badge with click handler
9. **Page integration** - Wire everything together

---

## Files to Create/Modify

### New Files
- `src/types/youtube.d.ts` - YouTube API types
- `src/components/providers/VideoPlayerProvider.tsx` - Seek context

### Modified Files
- `src/clean-architecture/domain/services/video-transcript.interface.ts`
- `src/clean-architecture/infrastructure/services/video-transcript.service.*.ts`
- `src/clean-architecture/domain/entities/question.entity.ts`
- `src/clean-architecture/infrastructure/repositories/question.repository.drizzle.ts`
- `src/clean-architecture/infrastructure/services/question-generator.service.langchain.ts`
- `src/clean-architecture/use-cases/question/generate-multiple-choice-questions.use-case.ts`
- `src/drizzle/schema.ts`
- `src/app/dashboard/video/[id]/VideoPlayer.tsx`
- `src/app/dashboard/video/[id]/QuizInterface.tsx`
- `src/app/dashboard/video/[id]/page.tsx`

---

## Testing Considerations

1. **Transcript service** - Mock responses with known timestamps
2. **Question generator** - Verify timestamps are within valid range
3. **Video player** - Test seek function with various timestamps
4. **UI** - Test timestamp badge click triggers seek
5. **Edge cases**:
   - Questions without timestamps (null handling)
   - Invalid timestamps (negative, beyond video length)
   - Multiple rapid seeks
