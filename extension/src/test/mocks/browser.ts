import { vi } from 'vitest';

type Tab = {
  id?: number;
  url?: string;
  active?: boolean;
};

type OnUpdatedInfo = {
  url?: string;
};

type OnActivatedInfo = {
  tabId: number;
};

type TabsQueryCallback = (tabs: Tab[]) => void;
type TabUpdateListener = (tabId: number, changeInfo: OnUpdatedInfo, tab: Tab) => void;
type TabActivatedListener = (activeInfo: OnActivatedInfo) => void;

const tabUpdateListeners: TabUpdateListener[] = [];
const tabActivatedListeners: TabActivatedListener[] = [];

export const mockBrowser = {
  tabs: {
    query: vi.fn<(query: { active: boolean; currentWindow: boolean }) => Promise<Tab[]>>(() =>
      Promise.resolve([])
    ),
    get: vi.fn<(tabId: number) => Promise<Tab>>(() => Promise.resolve({})),
    onUpdated: {
      addListener: vi.fn((listener: TabUpdateListener) => {
        tabUpdateListeners.push(listener);
      }),
      removeListener: vi.fn((listener: TabUpdateListener) => {
        const index = tabUpdateListeners.indexOf(listener);
        if (index > -1) {
          tabUpdateListeners.splice(index, 1);
        }
      }),
    },
    onActivated: {
      addListener: vi.fn((listener: TabActivatedListener) => {
        tabActivatedListeners.push(listener);
      }),
      removeListener: vi.fn((listener: TabActivatedListener) => {
        const index = tabActivatedListeners.indexOf(listener);
        if (index > -1) {
          tabActivatedListeners.splice(index, 1);
        }
      }),
    },
  },
};

// Helper to simulate tab updates
export function simulateTabUpdate(tabId: number, changeInfo: OnUpdatedInfo, tab: Tab) {
  tabUpdateListeners.forEach((listener) => listener(tabId, changeInfo, tab));
}

// Helper to simulate tab activation
export function simulateTabActivated(activeInfo: OnActivatedInfo) {
  tabActivatedListeners.forEach((listener) => listener(activeInfo));
}

// Helper to reset all mocks and listeners
export function resetBrowserMocks() {
  tabUpdateListeners.length = 0;
  tabActivatedListeners.length = 0;
  mockBrowser.tabs.query.mockReset();
  mockBrowser.tabs.get.mockReset();
  mockBrowser.tabs.onUpdated.addListener.mockClear();
  mockBrowser.tabs.onUpdated.removeListener.mockClear();
  mockBrowser.tabs.onActivated.addListener.mockClear();
  mockBrowser.tabs.onActivated.removeListener.mockClear();
}

// Setup the global browser mock
export function setupBrowserMock() {
  vi.stubGlobal('browser', mockBrowser);
}
