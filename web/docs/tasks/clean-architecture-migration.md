# Clean Architecture Migration

## Overview

This document tracks the ongoing migration from the current data-access/use-cases pattern to a proper Clean Architecture structure. The goal is to improve separation of concerns, testability, and maintainability by enforcing clear boundaries between layers.

## Architecture Layers

### Current Structure (Being Migrated From)
```
src/
├── data-access/           # Database queries mixed with business logic
│   ├── videos/
│   ├── summaries/
│   ├── questions/
│   └── ...
└── use-cases/             # Some business logic (incomplete)
```

### Target Clean Architecture Structure
```
src/clean-architecture/
├── domain/                           # Enterprise business rules
│   ├── entities/                     # Domain entities (business objects)
│   │   ├── video.entity.ts
│   │   ├── user.entity.ts
│   │   └── ...
│   └── repositories/                 # Repository interfaces (contracts)
│       ├── video.repository.interface.ts
│       ├── user.repository.interface.ts
│       └── ...
│
├── use-cases/                        # Application business rules
│   ├── video/
│   │   ├── create-video.use-case.ts
│   │   ├── find-video-by-user-id-and-url.use-case.ts
│   │   └── ...
│   ├── user/
│   └── extension/
│
└── infrastructure/                   # External interfaces & frameworks
    ├── repositories/                 # Repository implementations
    │   ├── video.repository.drizzle.ts
    │   ├── user.repository.drizzle.ts
    │   └── ...
    └── factories/                    # Dependency injection factories
        └── repository.factory.ts
```

## Clean Architecture Principles

### Dependency Rule
Dependencies must point inward only:
- **Domain** (innermost) - No dependencies on outer layers
- **Use Cases** - Depends only on Domain
- **Infrastructure** (outermost) - Depends on Domain and Use Cases

### Key Concepts

**1. Entities (Domain Layer)**
- Pure business objects with no framework dependencies
- Immutable properties (readonly)
- Example: `VideoEntity`, `UserEntity`

**2. Repository Interfaces (Domain Layer)**
- Define data access contracts
- No implementation details
- Example: `IVideoRepository`, `IUserRepository`

**3. Repository Implementations (Infrastructure Layer)**
- Implement repository interfaces
- Handle database-specific logic (Drizzle ORM)
- Map database records to domain entities via `toEntity()` method

**4. Use Cases (Use Case Layer)**
- Contain application-specific business rules
- Receive dependencies via constructor injection
- Execute single, well-defined operations

**5. Factories (Infrastructure Layer)**
- Create and wire up dependencies
- Example: `createVideoRepository()`, `createUserRepository()`

## Migration Steps

1. **Create Domain Layer** - Entity class and repository interface
2. **Create Infrastructure Layer** - Drizzle repository implementation and factory
3. **Create Use Cases** - Business logic with dependency injection
4. **Update Consumers** - Replace old data-access imports with new use cases
5. **Delete Old Code** - Remove old data-access folder after all consumers migrated

## Domain Architecture

We've identified **6 core domains** for this application:

1. **User** - User profiles and preferences
2. **Video** - Video catalog and metadata (lean - no summaries/questions)
3. **Summary** - AI-generated summaries (optional, can be generated on-demand)
4. **Question** - Quiz questions and options (optional, can be generated on-demand)
5. **Learning** - User answers and progress tracking (Leitner boxes/spaced repetition)
6. **Authentication** - Extension tokens and API authentication

**Services (not domains):**
- **User Stats** - Computed from Learning/Video data, not stored separately
- **Video Processing Pipeline** - Orchestrates multiple domains
- **External APIs** - Infrastructure adapters (OpenAI, YouTube)

**Design Decisions:**
- Video, Summary, and Question are **loosely coupled** (user can generate summaries/questions independently)
- Learning domain contains both Answer and Progress entities (they work together for spaced repetition)
- Authorization logic lives in **use case layer** (not repository layer)

## Migration Strategy

**Approach:** One domain at a time

1. Create all layers for one domain (entity, repository interface, repository implementation, use cases, factory)
2. Find all places using old data-access functions for that domain
3. Update all consumers to use new clean architecture pattern
4. Run tests to verify nothing broke
5. Delete old data-access folder for that domain
6. Move to next domain

**Order of domains to migrate:**
1. ✅ **User** (completed)
2. ✅ **Video** (completed)
3. ✅ **Summary** (completed)
4. ✅ **Question** (completed)
5. **Learning** (Answer + Progress entities)
6. **Authentication** (Extension tokens)

## Naming Conventions

**Repository Methods:**
- `createEntity()` - Create entity (e.g., `createVideo`, `createUser`)
- `findEntityById()` - Find by ID only (e.g., `findVideoById`)
- `findEntityByXAndY()` - Find by multiple criteria (e.g., `findVideoByUserIdAndUrl`)
- `findEntitiesByX()` - Find multiple (e.g., `findVideosByUserId`)
- `updateEntity()` - Update entity
- `deleteEntity()` - Delete entity

**Authorization Pattern:**
- Repository methods do **pure data access** (no authorization)
- Use cases handle **authorization explicitly**
- Example: `FindVideoByIdUseCase` checks if `video.userId === requestingUserId`

## Current Progress

### ✅ Completed Domains

**1. User Domain**
- UserEntity
- IUserRepository + DrizzleUserRepository
- Use cases: CheckEmailExistsUseCase
- Factory: createUserRepository()
- Status: All consumers migrated ✅

**2. Video Domain**
- VideoEntity (id, userId, platform, title, url, channelName, duration, createdAt)
- IVideoRepository + DrizzleVideoRepository
- Methods: createVideo, findVideoById, findVideoByUserIdAndUrl, findVideosByUserId
- Use cases: CreateVideoUseCase, FindVideoByIdUseCase, FindVideoByUserIdAndUrlUseCase, FindVideosByUserIdUseCase
- Factory: createVideoRepository()
- Migrated files:
  - ✅ API routes (videos/[url]/route.ts, videos/[url]/educational/route.ts)
  - ✅ Extension use case (process-video.ts)
  - ✅ Dashboard pages (page.tsx, video/[id]/page.tsx)
  - ✅ Library components (4 files)
  - ✅ Deleted old data-access/videos folder
- Status: **COMPLETE** ✅

**3. Summary Domain**
- SummaryEntity (id, videoId, content)
- ISummaryRepository + DrizzleSummaryRepository
- Methods: createSummary, findSummaryByVideoId
- Use cases: CreateSummaryUseCase, FindSummaryByVideoIdUseCase
- Factory: createSummaryRepository()
- Migrated files:
  - ✅ API route (videos/[url]/summarize/route.ts)
  - ✅ Dashboard page (video/[id]/page.tsx)
  - ✅ Client component type updated (ContentTabs.tsx)
  - ✅ Deleted old data-access/summaries folder
- Status: **COMPLETE** ✅

**4. Question Domain**
- QuestionEntity (discriminated union: MultipleChoiceQuestion)
- MultipleChoiceOption (value object, embedded in question)
- IQuestionRepository + DrizzleQuestionRepository
- Methods: createMultipleChoiceQuestion, findQuestionsByVideoId
- Use cases: CreateMultipleChoiceQuestionUseCase, FindQuestionsByVideoIdUseCase
- Factory: createQuestionRepository()
- **API Refactoring:** Moved from `/api/v1/videos/[url]/questions` to `/api/v1/questions` (cleaner REST design)
- Migrated files:
  - ✅ API route (questions/route.ts - new location)
  - ✅ Dashboard page (video/[id]/page.tsx)
  - ✅ ContentTabs + QuizInterface (type updates)
  - ✅ Video processing pipeline (process-video.ts - endpoint update)
  - ✅ Deleted old nested route and data-access folders (questions + question-options)
- Design decisions:
  - Used aggregate root pattern (Question contains Options as embedded value objects)
  - Discriminated union for future extensibility (flashcards, true/false, etc.)
  - Removed dead sorting code (options are shuffled randomly in UI)
- Status: **COMPLETE** ✅

### ⏳ Not Started

**5. Learning Domain**
- AnswerEntity + ProgressEntity
- IAnswerRepository + IProgressRepository
- Use cases: SubmitAnswerUseCase, UpdateProgressUseCase
- Contains spaced repetition (Leitner box) logic

**6. Authentication Domain**
- ExtensionTokenEntity
- IExtensionTokenRepository + DrizzleExtensionTokenRepository
- Use cases: ValidateTokenUseCase, CreateTokenUseCase, RevokeTokenUseCase

## Testing Strategy

- Maintain existing tests during migration
- Update test imports to use new clean architecture pattern
- Add new tests for repository implementations if needed
- Run full test suite after each domain migration

## Benefits of This Migration

1. **Separation of Concerns** - Each layer has a single responsibility
2. **Testability** - Easy to mock repositories and test use cases in isolation
3. **Flexibility** - Can swap database implementations without changing business logic
4. **Maintainability** - Clear structure makes codebase easier to navigate and understand
5. **Scalability** - Well-defined boundaries make it easier to add new features

## Notes

- Keep Supabase auth client for authentication only (not migrating auth)
- All database operations go through repositories
- Use cases should be thin wrappers initially; more complex logic can be added later
- Repository factories enable dependency injection and testing
