# Task: Clean Up Unnecessary DTOs

## Overview

After migrating to clean architecture, we need to review and remove DTOs (Data Transfer Objects) that are no longer needed. With entities now serving as our primary domain models, DTOs should only exist when the API response shape differs from the entity shape.

## When to Keep DTOs

Keep DTOs **only** when:

1. **Hiding fields** - API needs to return less than the entity has
   ```typescript
   // Example: Don't expose internal fields
   type UserResponseDto = Omit<UserEntity, 'passwordHash' | 'internalNotes'>
   ```

2. **Combining entities** - API needs to merge data from multiple sources
   ```typescript
   // Example: Video with summary and question count
   type VideoDetailDto = {
       ...VideoEntity,
       summary: string,
       questionCount: number,
   }
   ```

3. **Reshaping data** - API needs different structure/naming
   ```typescript
   // Example: Different naming convention for external API
   type ExternalApiDto = {
       channel_name: string,  // Entity uses channelName
       created_at: string,    // Entity uses createdAt
   }
   ```

4. **API versioning** - Different API versions need different shapes

## When to Delete DTOs

Delete DTOs when:

- ✅ The DTO is just an alias for the entity (`type VideoDto = VideoEntity`)
- ✅ The DTO is just Drizzle's inferred type (`type VideoDto = typeof videos.$inferSelect`)
- ✅ The API response shape exactly matches the entity
- ✅ The DTO doesn't add any transformation or reshaping logic

## Files to Review

### Videos Domain

- [ ] `web/src/data-access/videos/types.ts`
  - `VideoDto` - Currently just `typeof videos.$inferSelect`
  - `CreateVideoDto` - Currently just `typeof videos.$inferInsert`
  - **Recommendation:** Delete this file after migration is complete. Use `VideoEntity` instead.

### Other Domains (To be reviewed after migration)

- [ ] `web/src/data-access/summaries/types.ts` (if exists)
- [ ] `web/src/data-access/questions/types.ts` (if exists)
- [ ] `web/src/data-access/user-answers/types.ts` (if exists)
- [ ] Any other `types.ts` files in data-access folders

## Migration Strategy

1. **After migrating each domain to clean architecture:**
   - Review the `types.ts` file for that domain
   - Check if DTOs are just aliases for Drizzle types
   - Verify no API routes need different shapes

2. **Replace DTO usage with Entity:**
   ```typescript
   // BEFORE
   import { VideoDto } from "@/data-access/videos/types";
   const videos: VideoDto[] = await getVideos();

   // AFTER
   import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
   const videos: VideoEntity[] = await useCase.execute();
   ```

3. **Delete the types.ts file** if all DTOs are unnecessary

4. **Create DTOs only when needed:**
   - Place in `src/lib/dtos/` or `src/app/api/dtos/` (if API-specific)
   - Only create when response shape genuinely differs from entity

## Benefits of Cleanup

- ✅ Fewer files to maintain
- ✅ Single source of truth (entities)
- ✅ Clearer code (no confusion between VideoDto vs VideoEntity)
- ✅ Less duplication

## Notes

- This cleanup should happen **after** the clean architecture migration is complete
- Don't delete DTOs that are actively being used differently from entities
- If unsure, keep the DTO until you verify it's truly redundant
