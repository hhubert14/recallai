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

## Migration Pattern

### Step 1: Create Domain Layer
```typescript
// domain/entities/example.entity.ts
export class ExampleEntity {
    constructor(
        public readonly id: number,
        public readonly userId: string,
        public readonly name: string,
        public readonly createdAt: string,
    ) {}
}

// domain/repositories/example.repository.interface.ts
import { ExampleEntity } from "@/clean-architecture/domain/entities/example.entity";

export interface IExampleRepository {
    create(userId: string, name: string): Promise<ExampleEntity>;
    findById(id: number): Promise<ExampleEntity | null>;
    findByUserId(userId: string): Promise<ExampleEntity[]>;
}
```

### Step 2: Create Infrastructure Layer
```typescript
// infrastructure/repositories/example.repository.drizzle.ts
import { IExampleRepository } from "@/clean-architecture/domain/repositories/example.repository.interface";
import { ExampleEntity } from "@/clean-architecture/domain/entities/example.entity";
import { db } from "@/drizzle";
import { examples } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export class DrizzleExampleRepository implements IExampleRepository {
    async create(userId: string, name: string): Promise<ExampleEntity> {
        const [data] = await db
            .insert(examples)
            .values({ userId, name })
            .returning();
        return this.toEntity(data);
    }

    async findById(id: number): Promise<ExampleEntity | null> {
        const [data] = await db
            .select()
            .from(examples)
            .where(eq(examples.id, id))
            .limit(1);
        if (!data) return null;
        return this.toEntity(data);
    }

    async findByUserId(userId: string): Promise<ExampleEntity[]> {
        const data = await db
            .select()
            .from(examples)
            .where(eq(examples.userId, userId));
        return data.map(this.toEntity);
    }

    private toEntity(data: typeof examples.$inferSelect): ExampleEntity {
        return new ExampleEntity(
            data.id,
            data.userId,
            data.name,
            data.createdAt,
        );
    }
}

// infrastructure/factories/repository.factory.ts
export function createExampleRepository(): IExampleRepository {
    return new DrizzleExampleRepository();
}
```

### Step 3: Create Use Cases
```typescript
// use-cases/example/create-example.use-case.ts
import { IExampleRepository } from "@/clean-architecture/domain/repositories/example.repository.interface";
import { ExampleEntity } from "@/clean-architecture/domain/entities/example.entity";

export class CreateExampleUseCase {
    constructor(private readonly exampleRepository: IExampleRepository) {}

    async execute(userId: string, name: string): Promise<ExampleEntity> {
        return await this.exampleRepository.create(userId, name);
    }
}
```

### Step 4: Update Consumers
```typescript
// BEFORE
import { createExample } from "@/data-access/examples/create-example";
const example = await createExample(userId, name);

// AFTER
import { CreateExampleUseCase } from "@/clean-architecture/use-cases/example/create-example.use-case";
import { createExampleRepository } from "@/clean-architecture/infrastructure/factories/repository.factory";

const exampleRepo = createExampleRepository();
const createExampleUseCase = new CreateExampleUseCase(exampleRepo);
const example = await createExampleUseCase.execute(userId, name);
```

### Step 5: Delete Old Code
After all consumers are migrated, delete the old `data-access/examples/` folder.

## Migration Strategy

**Approach:** One domain at a time

1. Create all layers for one domain (entity, repository interface, repository implementation, use cases, factory)
2. Find all places using old data-access functions for that domain
3. Update all consumers to use new clean architecture pattern
4. Run tests to verify nothing broke
5. Delete old data-access folder for that domain
6. Move to next domain

**Order of domains to migrate:**
1. Videos (in progress)
2. Summaries
3. Questions
4. User Answers
5. User Question Progress (spaced repetition)
6. Extension Tokens
7. User Stats
8. External APIs (OpenAI, YouTube, etc.)

## Current Progress

### ✅ Completed
- Clean architecture structure created
- Video entity, repository, and use cases implemented
- User entity, repository, and use cases implemented

### 🚧 In Progress
**Videos Domain Migration:**
- [ ] Update API route: `videos/[url]/route.ts`
- [ ] Update API route: `videos/[url]/educational/route.ts`
- [ ] Update extension use case: `process-video.ts`
- [ ] Update dashboard pages (5 files)
- [ ] Delete old `data-access/videos/` folder

### ⏳ Not Started
- Summaries domain
- Questions domain
- User Answers domain
- User Question Progress domain
- Extension Tokens domain
- User Stats domain
- External APIs domain

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
