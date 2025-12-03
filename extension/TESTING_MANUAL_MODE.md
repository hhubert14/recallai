# Manual Processing Mode - Testing Guide

This document provides testing instructions for the manual processing mode feature.

## Prerequisites
- RecallAI account with authentication
- Chrome browser with extension loaded
- Access to YouTube

## Test Scenarios

### 1. Default Behavior (Automatic Mode)

**Objective**: Verify that existing users see no change in behavior

**Steps**:
1. Install/reload the extension (fresh install)
2. Click extension icon to open popup
3. Sign in to RecallAI if not already authenticated
4. Navigate to any YouTube video

**Expected Results**:
- ✅ Toggle switch should be blue (right position) indicating automatic mode
- ✅ Video should be automatically processed (existing behavior)
- ✅ No manual processing button should appear
- ✅ Popup shows: "Videos are processed automatically when you watch them"

### 2. Switching to Manual Mode

**Objective**: Verify mode toggle works correctly

**Steps**:
1. Open extension popup (should be in automatic mode)
2. Click the toggle switch

**Expected Results**:
- ✅ Toggle switches from blue (right) to gray (left)
- ✅ Text changes to: "You choose which videos to process manually"
- ✅ Main message updates to mention clicking 'Process This Video'
- ✅ Setting persists when closing/reopening popup

### 3. Manual Processing - Not on YouTube

**Objective**: Verify UI when in manual mode but not viewing YouTube

**Steps**:
1. Set extension to manual mode
2. Navigate to a non-YouTube page (e.g., google.com)
3. Open extension popup

**Expected Results**:
- ✅ Toggle shows manual mode (gray, left position)
- ✅ No video detection card appears
- ✅ No manual processing button appears
- ✅ Shows instruction to visit YouTube videos

### 4. Manual Processing - On YouTube Video

**Objective**: Verify video detection and manual processing

**Steps**:
1. Set extension to manual mode
2. Navigate to a YouTube video (e.g., https://youtube.com/watch?v=dQw4w9WgXcQ)
3. Open extension popup

**Expected Results**:
- ✅ Video detection card appears with blue background
- ✅ Shows "YouTube video detected"
- ✅ Shows video ID (e.g., "Video ID: dQw4w9WgXcQ")
- ✅ Shows "Process This Video" button
- ✅ Button is enabled and clickable

### 5. Manual Processing - Button Click

**Objective**: Verify manual processing request works

**Steps**:
1. Be in manual mode on a YouTube video
2. Open extension popup
3. Click "Process This Video" button

**Expected Results**:
- ✅ Button immediately shows "Processing..." and becomes disabled
- ✅ After request completes, success message appears in green box
- ✅ Message says: "Video queued for processing! Check your dashboard soon."
- ✅ Video should appear in dashboard after processing completes (may take a few minutes)

### 6. Manual Processing - No Auto-Processing

**Objective**: Verify videos are NOT auto-processed in manual mode

**Steps**:
1. Set extension to manual mode
2. Navigate to multiple YouTube videos
3. DO NOT click the processing button
4. Wait 1-2 minutes
5. Check dashboard

**Expected Results**:
- ✅ Videos should NOT appear in dashboard
- ✅ Background script should log: "Video {id} detected but skipping auto-process (mode: manual)"
- ✅ No automatic processing should occur

### 7. Switching Back to Automatic

**Objective**: Verify switching back to automatic mode restores auto-processing

**Steps**:
1. Set extension to manual mode
2. Visit a YouTube video (don't process)
3. Open popup and switch to automatic mode
4. Navigate to a new YouTube video

**Expected Results**:
- ✅ Toggle switches to blue (right position)
- ✅ Text changes back to automatic mode message
- ✅ Video detection card disappears (even on YouTube)
- ✅ New video is automatically processed
- ✅ Background script logs: "Processing video with ID: {id}"

### 8. Persistence Across Sessions

**Objective**: Verify settings persist across browser restarts

**Steps**:
1. Set extension to manual mode
2. Close browser completely
3. Reopen browser
4. Open extension popup

**Expected Results**:
- ✅ Mode remains set to manual (gray, left position)
- ✅ Setting is not reset to automatic

### 9. Multiple Tab Handling

**Objective**: Verify detection works across multiple tabs

**Steps**:
1. Set to manual mode
2. Open YouTube video in Tab 1
3. Open extension popup - should detect video
4. Switch to Tab 2 (non-YouTube)
5. Open extension popup

**Expected Results**:
- ✅ In Tab 1: Video detection card appears
- ✅ In Tab 2: No video detection card
- ✅ Popup correctly detects active tab

### 10. Error Handling

**Objective**: Verify error messages appear on failure

**Steps**:
1. Disconnect from internet
2. Set to manual mode on YouTube video
3. Click "Process This Video"

**Expected Results**:
- ✅ Error message appears in red box
- ✅ Message indicates failure
- ✅ Button returns to "Process This Video" state

## Console Logging

Check browser console logs for debugging:

**Automatic Mode**:
```
RecallAI background script loaded
Processing video with ID: {videoId}
```

**Manual Mode (video detected)**:
```
RecallAI background script loaded
Video {videoId} detected but skipping auto-process (mode: manual)
```

**Manual Processing Request**:
```
Manual processing request for video: {videoId}
```

## Known Limitations

1. **Type Safety**: `useCurrentTab` uses `any` types for tab event parameters due to WXT type limitations. This is acceptable as the implementation is tested and functional.

2. **Tab Detection**: The current tab hook updates when tabs change, but there may be a brief delay when switching tabs very quickly.

3. **Processing Feedback**: The extension doesn't track individual video processing status. Users must check their dashboard to see completed processing.

## Testing Tools

### Browser Console
```javascript
// Check current storage
chrome.storage.local.get(null, console.log)

// Set mode manually
chrome.storage.local.set({ processingMode: 'manual' })
chrome.storage.local.set({ processingMode: 'automatic' })

// Clear all storage
chrome.storage.local.clear()
```

### Extension Developer Mode
1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Inspect views: background page" to see background console
4. Click extension icon and right-click popup, select "Inspect" for popup console

## Regression Testing

Ensure these existing features still work:
- ✅ Authentication flow
- ✅ Automatic processing (when in automatic mode)
- ✅ 5-minute deduplication cache
- ✅ External message handling
- ✅ Dashboard link opens correctly
- ✅ Sign out functionality
- ✅ Extension icon and popup display
