# Manual Processing Mode Feature

This document explains the manual processing mode feature added to the RecallAI Chrome extension.

## Overview

The extension now supports two processing modes:
- **Automatic Mode** (default): Videos are automatically processed when you watch them on YouTube
- **Manual Mode**: You choose which videos to process by clicking a button

## User Interface Changes

### Processing Mode Toggle
A new toggle switch has been added to the popup that allows users to switch between automatic and manual modes:
- **Blue (right position)**: Automatic mode is enabled
- **Gray (left position)**: Manual mode is enabled

### Manual Processing Button
When in manual mode and viewing a YouTube video, the popup displays:
- A video detection card showing the current YouTube video ID
- A "Process This Video" button to manually trigger processing
- Visual feedback during processing (button disabled with "Processing..." text)
- Success/error messages after processing completes

## Technical Implementation

### New Files
1. **`src/lib/storage.ts`**: Storage helper functions for managing processing mode setting
   - `getProcessingMode()`: Retrieves current mode from storage
   - `setProcessingMode(mode)`: Saves mode to storage
   - `getSettings()`: Retrieves all settings

2. **`src/hooks/useCurrentTab.ts`**: React hook to detect current tab and YouTube video
   - Returns `{ url, videoId, isYouTube }` for the current tab
   - Listens for tab updates to keep info current

3. **`src/hooks/useProcessingMode.ts`**: React hook to manage processing mode
   - Returns current mode and function to update it
   - Persists changes to storage

### Modified Files
1. **`src/entrypoints/background.ts`**:
   - Added check for processing mode before auto-processing videos
   - Added message handler for manual processing requests from popup
   - Videos are only auto-processed when mode is set to 'automatic'

2. **`src/entrypoints/popup/App.tsx`**:
   - Added processing mode toggle switch
   - Added YouTube video detection and display
   - Added manual processing button with loading and result states
   - Updated UI to show appropriate messages based on mode

## User Flow

### Automatic Mode (Default)
1. User is signed in to RecallAI
2. Extension is in automatic mode (toggle is blue, to the right)
3. When user visits a YouTube video, it's automatically queued for processing
4. No user action required

### Manual Mode
1. User is signed in to RecallAI
2. User toggles processing mode to manual (toggle turns gray, moves to left)
3. When user visits a YouTube video:
   - Popup shows video detection card with video ID
   - User clicks "Process This Video" button
   - Button shows "Processing..." during the request
   - Success message appears when complete
4. Videos are only processed when user explicitly clicks the button

## Storage Schema

The extension now stores the following in `chrome.storage.local`:
```typescript
{
  processingMode: 'automatic' | 'manual'  // default: 'automatic'
}
```

## Message Passing

The popup communicates with the background script via `chrome.runtime.sendMessage`:

```typescript
// Request manual processing
browser.runtime.sendMessage({
  action: 'processVideo',
  videoUrl: string,
  videoId: string
})

// Response
{
  success: boolean,
  error?: string
}
```

## Backward Compatibility

- Default mode is 'automatic', maintaining existing behavior for current users
- No breaking changes to existing functionality
- All automatic processing features continue to work as before

## Future Enhancements

Potential improvements for future versions:
- Add processing history/queue viewer in popup
- Show processing status for specific videos
- Add bulk processing options
- Configurable auto-processing filters (channel, duration, etc.)
