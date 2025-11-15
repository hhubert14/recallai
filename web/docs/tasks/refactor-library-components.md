# Task: Refactor Library Page Component Structure

## Overview

The library page currently has excessive nesting of components that can be simplified. The current structure has unnecessary intermediate components that just pass data through without adding meaningful functionality.

## Current Structure

```
page.tsx (Server Component)
  └─ LibraryVideoList (Server Component)
      └─ ClientLibraryVideoList (Client Component)
          └─ LibraryVideoCard (Client Component)
```

### Current Flow

1. **page.tsx**
   - Fetches all user videos
   - Passes to `LibraryVideoList`

2. **LibraryVideoList** (Server Component)
   - Receives videos
   - Fetches quiz completion status for each video
   - Passes enriched data to `ClientLibraryVideoList`

3. **ClientLibraryVideoList** (Client Component)
   - Uses `useEffect` to initialize quiz completion state
   - Maps over videos and renders `LibraryVideoCard` for each

4. **LibraryVideoCard** (Client Component)
   - Displays individual video card
   - Uses quiz completion context

## Issues

1. **Unnecessary wrapper component** - `LibraryVideoList` just fetches quiz completion and passes data through
2. **Extra prop drilling** - Data passes through multiple layers unnecessarily
3. **Not immediately clear which components are Server vs Client** - Component names don't indicate this
4. **Maintenance overhead** - More files to maintain for simple data flow

## Proposed Refactor

### Simplified Structure

```
page.tsx (Server Component)
  └─ ClientLibraryVideoList (Client Component)
      └─ LibraryVideoCard (Client Component)
```

### Implementation

**File: `page.tsx`**
```typescript
export default async function LibraryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Fetch videos
    const videoRepo = createVideoRepository();
    const videos = await new FindVideosByUserIdUseCase(videoRepo).execute(user.id);

    // Fetch quiz completion status for all videos (move logic from LibraryVideoList)
    const videosWithCompletion = await Promise.all(
        videos.map(async video => ({
            ...video,
            quizCompleted: await getQuizCompletionStatus(user.id, video.id),
        }))
    );

    return (
        <div className="flex min-h-screen flex-col">
            {/* Header, nav, etc. */}
            <main>
                <h1>My Library</h1>
                <ClientLibraryVideoList videos={videosWithCompletion} />
            </main>
        </div>
    );
}
```

**File: `ClientLibraryVideoList.tsx`** (keep as-is or simplify)
```typescript
"use client";

import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { LibraryVideoCard } from "./LibraryVideoCard";
import { useQuizCompletion } from "@/components/providers/QuizCompletionProvider";

interface ClientLibraryVideoListProps {
    videos: (VideoEntity & { quizCompleted: boolean })[];
}

export function ClientLibraryVideoList({ videos }: ClientLibraryVideoListProps) {
    const { markVideoAsCompleted } = useQuizCompletion();

    // Initialize completed videos from server data
    useEffect(() => {
        videos.forEach(video => {
            if (video.quizCompleted) {
                markVideoAsCompleted(video.id);
            }
        });
    }, []);

    if (videos.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="space-y-3">
            {videos.map(video => (
                <LibraryVideoCard key={video.id} video={video} />
            ))}
        </div>
    );
}
```

**File: `LibraryVideoCard.tsx`** (keep as-is)

## Benefits of Refactor

1. ✅ **Fewer files** - Delete `LibraryVideoList.tsx` (one less file to maintain)
2. ✅ **Clearer data flow** - All data fetching in one place (`page.tsx`)
3. ✅ **Less prop drilling** - One fewer component layer
4. ✅ **Easier to understand** - Clear Server/Client boundary at `ClientLibraryVideoList`
5. ✅ **Better naming** - "Client" prefix makes it obvious which components run where

## Files to Change

### Files to Modify
- [ ] `web/src/app/dashboard/library/page.tsx` - Move quiz completion logic here
- [ ] `web/src/app/dashboard/library/ClientLibraryVideoList.tsx` - May need minor adjustments

### Files to Delete
- [ ] `web/src/app/dashboard/library/LibraryVideoList.tsx` - No longer needed

## Additional Considerations

### Alternative: Keep LibraryVideoList but Rename

If you want to keep the separation for some reason:
- Rename `LibraryVideoList.tsx` → `ServerLibraryVideoList.tsx` (makes it clear it's a Server Component)
- Rename `ClientLibraryVideoList.tsx` → `LibraryVideoList.tsx` (simpler name for the main component)

But honestly, the component doesn't do much beyond data fetching, so merging into `page.tsx` is cleaner.

### Consider Empty State Component

The empty state HTML is duplicated in both `LibraryVideoList` and `ClientLibraryVideoList`. Consider extracting to:

```typescript
// LibraryEmptyState.tsx
export function LibraryEmptyState() {
    return (
        <div className="text-center py-12">
            {/* Empty state UI */}
        </div>
    );
}
```

## Related Patterns

This same pattern might exist in other dashboard pages. After refactoring the library page, check:
- `dashboard/page.tsx` - Does it have unnecessary wrappers?
- `dashboard/video/[id]/page.tsx` - Check component structure
- `dashboard/review/page.tsx` - If it exists

## Priority

**Medium** - Not blocking functionality, but improves code maintainability and clarity.

## Estimated Effort

**15-30 minutes** - Straightforward refactor, mostly moving code and deleting one file.
