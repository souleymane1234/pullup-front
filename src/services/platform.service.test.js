import { describe, expect, it } from 'vitest';
import {
  completeOnboarding,
  getPlatform,
  listNotifications,
  markNotificationsRead,
  toPreferencesBody,
} from './platform.service.js';

describe('plateforme via l’API', () => {
  it('GET /platform renvoie les flags et l’onboarding', async () => {
    const snapshot = await getPlatform();
    expect(snapshot).toEqual({
      flags: { v2: true, v3: true },
      onboarded: false,
    });
  });

  it('GET /notifications, POST /read et PUT /me/preferences', async () => {
    const items = await listNotifications();
    expect(items[0]).toMatchObject({
      to: 'i1',
      r: false,
      link: '/c/c1',
    });
    expect(await markNotificationsRead()).toBeNull();
    expect(toPreferencesBody()).toEqual({ onboarded: true });
    expect(await completeOnboarding()).toBeNull();
  });
});
