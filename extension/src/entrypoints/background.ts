import { processVideo } from '@/services/api';
import { extractVideoId } from '@/lib/youtube';
import { getProcessingMode } from '@/lib/storage';

export default defineBackground(() => {
  console.log('RecallAI background script loaded');

  const processedVideos = new Map<string, number>(); // videoId -> timestamp

  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      const videoId = extractVideoId(tab.url);

      if (videoId) {
        // Check processing mode - only auto-process in automatic mode
        const mode = await getProcessingMode();
        if (mode !== 'automatic') {
          console.log(`Video ${videoId} detected but skipping auto-process (mode: ${mode})`);
          return;
        }

        const lastProcessed = processedVideos.get(videoId);
        const now = Date.now();

        // Skip if processed in last 5 minutes
        if (lastProcessed && now - lastProcessed < 5 * 60 * 1000) {
          console.log(`Video ${videoId} already processed recently, skipping`);
          return;
        }

        processedVideos.set(videoId, now);
        console.log(`Processing video with ID: ${videoId}`);
        processVideo(tab.url);

        // Cleanup old entries every 100 requests
        if (processedVideos.size > 100) {
          const fiveMinutesAgo = now - 5 * 60 * 1000;
          for (const [id, timestamp] of processedVideos) {
            if (timestamp < fiveMinutesAgo) {
              processedVideos.delete(id);
            }
          }
        }
      }
    }
  });

  // Handle manual processing requests from popup
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'processVideo') {
      const { videoUrl, videoId } = message;
      console.log(`Manual processing request for video: ${videoId}`);
      
      processedVideos.set(videoId, Date.now());
      processVideo(videoUrl)
        .then((success) => {
          sendResponse({ success });
        })
        .catch((error) => {
          console.error('Error processing video:', error);
          sendResponse({ success: false, error: error.message });
        });
      
      return true; // Keep channel open for async response
    }
  });

  // TODO: Add handlers for backend notifications (success/failure) from video processing
  // External message listener (for future use)
  browser.runtime.onMessageExternal.addListener(
    (request, sender, sendResponse) => {
      if (!request.action) {
        console.error('No action specified in request');
        return;
      }
      console.log('Received external message:', request);
      sendResponse({ success: true });
      return true;
    }
  );
});
