import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { downloadCampaignsCsv } from '@/services/spaces.service.js';
import { server } from './mocks/server.js';

describe('export CSV', () => {
  it('lit le message JSON d’un 403 même si la réponse est un blob', async () => {
    server.use(http.get('http://localhost:3000/api/me/campaigns.csv', () => HttpResponse.json(
      { message: 'Action non autorisée pour ce compte.' },
      { status: 403 },
    )));
    await expect(downloadCampaignsCsv()).rejects.toThrow('Action non autorisée pour ce compte.');
  });
});
