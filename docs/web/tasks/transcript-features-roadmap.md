# Transcript Features Roadmap

This document outlines a series of related features that build on storing video transcripts with timestamps.

## Overview

Currently, transcripts are fetched on-demand from an external service each time content is generated. This roadmap proposes storing transcripts with timestamps, then leveraging that data for enhanced learning features.

## Feature Progression

```
┌─────────────────────────────────────┐
│ 1. Timestamps + Transcript Storage  │  ← Foundation
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│ 2. Question → Timestamp Linking     │  ← Quick win
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│ 3. RAG Chatbot                      │  ← Advanced
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 4. Free LLM Provider Migration      │  ← Cost savings (independent)
└─────────────────────────────────────┘
```

---

## Phase 1: Transcript Storage with Timestamps

### Current State

- Transcripts fetched via `StrapiVideoTranscriptService` on every generation request
- No persistence - same transcript fetched multiple times
- Unknown if timestamps are available from current service

### Investigation Needed

Check what the current transcript service returns:
- Does it include timestamps?
- What format? (SRT, VTT, JSON with segments?)
- If no timestamps, evaluate alternative services:
  - YouTube Data API (captions track)
  - `youtube-transcript` npm package
  - AssemblyAI, Deepgram (if YouTube captions unavailable)

### Database Schema

**Option A: Separate table (recommended)**

```sql
CREATE TABLE transcripts (
  id SERIAL PRIMARY KEY,
  video_id BIGINT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  content TEXT NOT NULL,              -- Full plain text (for simple queries)
  segments JSONB NOT NULL,            -- Array of {text, startTime, endTime}
  language VARCHAR(10),               -- e.g., 'en', 'es'
  source VARCHAR(50) NOT NULL,        -- e.g., 'youtube', 'assemblyai'
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(video_id)
);
```

Segments JSONB structure:
```json
[
  { "text": "Hello and welcome to this video", "startTime": 0.0, "endTime": 3.5 },
  { "text": "Today we're going to talk about", "startTime": 3.5, "endTime": 6.2 },
  ...
]
```

**Option B: Column on videos table**

Simpler but less flexible:
```sql
ALTER TABLE videos
ADD COLUMN transcript TEXT,
ADD COLUMN transcript_segments JSONB;
```

### Implementation Steps

1. Investigate current transcript service output format
2. Add Drizzle schema for transcripts table
3. Create `TranscriptEntity` and `ITranscriptRepository`
4. Modify video processing pipeline to store transcript after fetch
5. Update generation use cases to:
   - First check DB for existing transcript
   - Fall back to external fetch if not found
   - Store transcript if fetched externally

### Files to Create/Modify

- `src/drizzle/schema.ts` - Add transcripts table
- `src/clean-architecture/domain/entities/transcript.entity.ts`
- `src/clean-architecture/domain/repositories/transcript.repository.interface.ts`
- `src/clean-architecture/infrastructure/repositories/transcript.repository.drizzle.ts`
- `src/clean-architecture/use-cases/flashcard/generate-flashcards.use-case.ts`
- `src/clean-architecture/use-cases/question/generate-multiple-choice-questions.use-case.ts`

---

## Phase 2: Question → Timestamp Linking

### Concept

When generating multiple-choice questions, the AI identifies which part of the video the question relates to. Users can click to jump to that timestamp in the video player.

### User Experience

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

### Database Changes

Add timestamp to questions table:

```sql
ALTER TABLE questions
ADD COLUMN source_timestamp_start REAL,  -- seconds
ADD COLUMN source_timestamp_end REAL;    -- seconds (optional, for range)
```

Or store as integer milliseconds for precision.

### AI Prompt Changes

Modify the question generation prompt to return timestamps:

```typescript
const schema = z.object({
  questions: z.array(z.object({
    questionText: z.string(),
    options: z.array(/* ... */),
    sourceTimestamp: z.number().optional(), // seconds into video
  })),
});
```

The prompt would include transcript segments with timestamps, asking the AI to identify which segment each question relates to.

### UI Changes

1. Add timestamp badge to question card
2. On click, seek video player to timestamp
3. Requires communication between `QuizInterface` and `VideoPlayer` components
   - Could use React context, callback prop, or URL hash

### Implementation Steps

1. Modify question generation prompt to request timestamps
2. Update `MultipleChoiceQuestionEntity` to include timestamp
3. Add columns to questions table
4. Update `QuizInterface` to display timestamp links
5. Add seek functionality to video player integration

---

## Phase 3: RAG Chatbot

### Concept

Users can ask natural language questions about the video content. The system retrieves relevant transcript segments and generates answers with citations.

### User Experience

```
┌─────────────────────────────────────────────────────┐
│ Ask about this video                                │
├─────────────────────────────────────────────────────┤
│ User: What are the three main benefits mentioned?   │
│                                                     │
│ Assistant: The video mentions three main benefits:  │
│                                                     │
│ 1. Improved testability [▶ 4:23]                    │
│ 2. Loose coupling [▶ 6:45]                          │
│ 3. Easier maintenance [▶ 8:12]                      │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Ask a question...                          [→]  │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Architecture

```
User Question
     ↓
┌─────────────────┐
│ Embed Question  │  → OpenAI embeddings
└────────┬────────┘
         ↓
┌─────────────────┐
│ Vector Search   │  → Find similar transcript chunks
└────────┬────────┘
         ↓
┌─────────────────┐
│ Retrieve Chunks │  → Get top-k relevant segments
└────────┬────────┘
         ↓
┌─────────────────┐
│ Generate Answer │  → LLM with context + timestamps
└────────┬────────┘
         ↓
   Response with Citations
```

### Vector Storage Options

**Option A: pgvector (PostgreSQL extension)**
- Keep everything in PostgreSQL
- Add via Supabase dashboard or migration
- Good for moderate scale

```sql
CREATE EXTENSION vector;

CREATE TABLE transcript_embeddings (
  id SERIAL PRIMARY KEY,
  transcript_id BIGINT REFERENCES transcripts(id),
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  start_time REAL NOT NULL,
  end_time REAL NOT NULL,
  embedding vector(1536),  -- OpenAI ada-002 dimension
  UNIQUE(transcript_id, chunk_index)
);

CREATE INDEX ON transcript_embeddings
USING ivfflat (embedding vector_cosine_ops);
```

**Option B: Dedicated vector DB**
- Pinecone, Weaviate, Qdrant
- Better for large scale
- Additional service to manage

**Recommendation:** Start with pgvector for simplicity since you're already using Supabase/PostgreSQL.

### Chunking Strategy

Split transcript into overlapping chunks:
- Chunk size: ~200-500 tokens
- Overlap: 50-100 tokens
- Preserve timestamp boundaries where possible

```typescript
interface TranscriptChunk {
  text: string;
  startTime: number;
  endTime: number;
  embedding: number[];
}
```

### Implementation Steps

1. Enable pgvector extension in Supabase
2. Create embeddings table schema
3. Build chunking utility for transcripts
4. Create embedding generation service (OpenAI)
5. Implement embedding storage on transcript creation
6. Build retrieval service (similarity search)
7. Create chat use case (retrieve → generate)
8. Build chat API endpoint
9. Create chat UI component

### New Files

- `src/clean-architecture/domain/services/embedding.interface.ts`
- `src/clean-architecture/infrastructure/services/embedding.service.openai.ts`
- `src/clean-architecture/use-cases/chat/answer-video-question.use-case.ts`
- `src/app/api/v1/videos/[id]/chat/route.ts`
- `src/app/dashboard/video/[id]/ChatInterface.tsx`

### Cost Considerations

- Embedding generation: ~$0.0001 per 1K tokens (ada-002)
- Chat completion: ~$0.002 per 1K tokens (gpt-3.5-turbo)
- Consider caching common questions/answers

---

## Phase 4: Free/Low-Cost LLM Provider Migration

### Problem

Currently using OpenAI which incurs costs for every API call. For a learning platform with frequent content generation, this can become expensive.

### Free Tier Options (Research as of December 2025)

#### 1. Google Gemini API (Recommended)

The strongest free tier available:

| Model | Requests/Min | Tokens/Min | Requests/Day |
|-------|--------------|------------|--------------|
| Gemini 2.5 Flash | 10 | 250,000 | 250 |
| Gemini 2.5 Flash-Lite | 15 | 250,000 | 1,000 |
| Gemini 2.5 Pro | 5 | 250,000 | 100 |

**Advantages:**
- No credit card required
- Supports structured JSON output (critical for question/flashcard generation)
- Commercial use explicitly allowed
- 1M token context window
- Flash-Lite with 1,000 requests/day could handle decent traffic for free

**Links:**
- [Gemini API Free Tier Guide](https://blog.laozhang.ai/api-guides/gemini-api-free-tier/)
- [Gemini API Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)

#### 2. Groq

Extremely fast inference (300+ tokens/sec):

- Free tier available, no credit card needed
- Supports structured JSON output and function calling
- Runs open-source models (Llama 3.3 70B, Mixtral)
- Rate limits are organization-level

**Best for:** Speed-sensitive operations like chat responses.

**Links:**
- [Groq Rate Limits Docs](https://console.groq.com/docs/rate-limits)

#### 3. OpenRouter

Unified API for 300+ models:

- 20 requests/min, 200 requests/day on free tier
- Access to free models (DeepSeek, Mistral, Zephyr, etc.)
- Single API, multiple providers
- Good fallback/routing capabilities

**Best for:** Flexibility and fallback routing.

**Links:**
- [OpenRouter](https://openrouter.ai)
- [Using LLM APIs for Free with OpenRouter](https://gaikarkshitij.medium.com/using-llm-apis-for-free-with-openrouter-ai-2025-edition-2c2c677c64bf)

#### 4. Together AI

- Free access to open models (Mistral, Mixtral, Gemma)
- Low latency, cloud-managed
- Some fine-tuning support

### Recommended Strategy for RecallAI

| Use Case | Provider | Rationale |
|----------|----------|-----------|
| Question Generation | Google Gemini Flash-Lite | 1,000 req/day free, structured output |
| Flashcard Generation | Google Gemini Flash-Lite | Same as above |
| Summarization | Google Gemini Flash | Higher quality for longer content |
| RAG Chatbot (future) | Groq | Speed matters for chat UX |
| Fallback | OpenRouter | Route to cheapest available model |

### Implementation Approach

#### Option A: Direct Provider Integration

Create separate service implementations:

```typescript
// Current
src/clean-architecture/infrastructure/services/question-generator.service.langchain.ts

// New implementations
src/clean-architecture/infrastructure/services/question-generator.service.gemini.ts
src/clean-architecture/infrastructure/services/question-generator.service.groq.ts
```

Switch via environment variable:
```typescript
const generator = process.env.LLM_PROVIDER === 'gemini'
  ? new GeminiQuestionGeneratorService()
  : new LangChainQuestionGeneratorService();
```

#### Option B: OpenRouter as Abstraction Layer

Use OpenRouter as a single integration point that can route to any provider:

```typescript
// Single implementation that works with any model
src/clean-architecture/infrastructure/services/question-generator.service.openrouter.ts
```

Configure model via environment:
```bash
OPENROUTER_MODEL=google/gemini-2.5-flash-lite  # or any other model
```

**Recommendation:** Option B (OpenRouter) provides more flexibility with less code. You can switch models without code changes, and OpenRouter handles fallbacks automatically.

### Migration Steps

1. Evaluate structured output support for target models
2. Create OpenRouter service implementation (or direct Gemini)
3. Update LangChain prompts if needed (different models may need prompt adjustments)
4. Test question/flashcard quality with new models
5. Add environment variable for provider selection
6. Monitor usage and quality

### Environment Variables

```bash
# Option A: Direct integration
LLM_PROVIDER=gemini  # or 'openai', 'groq'
GOOGLE_AI_API_KEY=

# Option B: OpenRouter
OPENROUTER_API_KEY=
OPENROUTER_MODEL=google/gemini-2.5-flash-lite
```

### Cost Comparison

| Provider | Model | Cost per 1K tokens |
|----------|-------|-------------------|
| OpenAI | GPT-4o | ~$0.005 input, $0.015 output |
| OpenAI | GPT-3.5 Turbo | ~$0.0005 input, $0.0015 output |
| Google | Gemini Flash-Lite | **Free** (within limits) |
| Google | Gemini Flash | **Free** (within limits) |
| Groq | Llama 3.3 70B | **Free** (within limits) |

### Quality Considerations

- Gemini and Llama 3.3 70B produce quality comparable to GPT-3.5/4 for structured tasks
- Test thoroughly - different models may need prompt adjustments
- Keep OpenAI as fallback for edge cases if needed

---

## Priority & Effort Estimates

| Phase | Priority | Effort | Dependencies |
|-------|----------|--------|--------------|
| 1. Transcript Storage | High | Low | None |
| 2. Timestamp Linking | Medium | Medium | Phase 1 |
| 3. RAG Chatbot | Low | High | Phase 1, pgvector |
| 4. LLM Provider Migration | Medium | Low-Medium | None (independent) |

## Recommendation

Start with Phase 1 immediately - it's low effort and provides:
- Cost savings (fewer external API calls)
- Performance improvement (no transcript fetch latency)
- Foundation for all future features

Phase 2 is a good quick win after Phase 1 - improves UX significantly with moderate effort.

Phase 3 is a larger project best tackled when there's dedicated time for it.

Phase 4 (LLM Provider Migration) can be done in parallel with other phases - it's independent and provides immediate cost savings. Consider prioritizing if API costs are a concern.
