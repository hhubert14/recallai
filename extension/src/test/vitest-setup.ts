import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Create a persistent browser mock that won't be removed during test cleanup
const createBrowserMock = () => ({
  tabs: {
    query: vi.fn(() => Promise.resolve([])),
    get: vi.fn(() => Promise.resolve({})),
    onUpdated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onActivated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
});

// Set up browser mock globally - this ensures it's always available
// even during React cleanup phases
vi.stubGlobal('browser', createBrowserMock());
