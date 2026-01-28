import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';

vi.mock('@/services/api', () => ({
  checkAuthStatus: vi.fn(),
}));

import { checkAuthStatus } from '@/services/api';

const mockCheckAuthStatus = vi.mocked(checkAuthStatus);

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with loading state', () => {
    mockCheckAuthStatus.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useAuth());

    expect(result.current.authState).toBe('loading');
  });

  it('transitions to authenticated when checkAuthStatus returns true', async () => {
    mockCheckAuthStatus.mockResolvedValue(true);

    const { result } = renderHook(() => useAuth());

    expect(result.current.authState).toBe('loading');

    await waitFor(() => {
      expect(result.current.authState).toBe('authenticated');
    });
  });

  it('transitions to unauthenticated when checkAuthStatus returns false', async () => {
    mockCheckAuthStatus.mockResolvedValue(false);

    const { result } = renderHook(() => useAuth());

    expect(result.current.authState).toBe('loading');

    await waitFor(() => {
      expect(result.current.authState).toBe('unauthenticated');
    });
  });

  it('transitions to unauthenticated when checkAuthStatus throws an error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockCheckAuthStatus.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuth());

    expect(result.current.authState).toBe('loading');

    await waitFor(() => {
      expect(result.current.authState).toBe('unauthenticated');
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error checking auth:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  it('only calls checkAuthStatus once on mount', async () => {
    mockCheckAuthStatus.mockResolvedValue(true);

    renderHook(() => useAuth());

    await waitFor(() => {
      expect(mockCheckAuthStatus).toHaveBeenCalledTimes(1);
    });
  });
});
