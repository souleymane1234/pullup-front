import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { completeOnboarding, listNotifications, markNotificationsRead } from '@/services/platform.service.js';
import { server } from './mocks/server.js';

const API = 'http://localhost:3000/api';
const UNAUTH = { message: 'Connectez-vous pour continuer.' };

describe('plateforme sans session', () => {
  it('GET /notifications 401 → liste vide', async () => {
    server.use(http.get(`${API}/notifications`, () => HttpResponse.json(UNAUTH, { status: 401 })));
    expect(await listNotifications()).toEqual([]);
  });

  it('POST /notifications/read et PUT /me/preferences 401 → null', async () => {
    server.use(
      http.post(`${API}/notifications/read`, () => HttpResponse.json(UNAUTH, { status: 401 })),
      http.put(`${API}/me/preferences`, () => HttpResponse.json(UNAUTH, { status: 401 })),
    );
    expect(await markNotificationsRead()).toBeNull();
    expect(await completeOnboarding()).toBeNull();
  });
});
