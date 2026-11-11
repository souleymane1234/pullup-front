import { describe, expect, it } from 'vitest';
import { autoValidatePublished } from './campaigns.service.js';
import { setFlag, toFlagBody } from './platform.service.js';
import {
  certifyInfluencer,
  creditBrand,
  downloadLedgerCsv,
  getAdminDashboard,
  getFinanceSummary,
  listAuditLog,
  listWithdrawals,
  retryWithdrawal,
  suspendInfluencer,
  toCreditBody,
  toScoresBody,
  toSuspendBody,
  updateInfluencerScores,
} from './admin.service.js';
import { rejectInfluencer, toRejectBody } from './influencers.service.js';

describe('admin via l’API', () => {
  it('GET /admin/dashboard', async () => {
    const dash = await getAdminDashboard();
    expect(dash.flags).toEqual({ v2: true, v3: true });
    expect(dash.campaigns[0].ref).toBe('PU-2410-137');
    expect(dash.brands[0].plan).toBe('pro');
  });

  it('GET finance, retraits et audit', async () => {
    expect(await getFinanceSummary()).toEqual({
      escrow: 390000, commissionsMonth: 97500, pendingWithdrawals: 0, gaps: [],
    });
    const csv = await downloadLedgerCsv({ from: '2026-10-01', to: '2026-10-07' });
    expect(csv).toBeInstanceOf(Blob);
    const withdrawals = await listWithdrawals();
    expect(withdrawals[0].status).toBe('sent');
    expect(withdrawals[1].status).toBe('failed');
    const audit = await listAuditLog();
    expect(audit[0].action).toBe('influencer_reject');
    expect(audit[0].data.reason).toBe('Profil incomplet.');
  });

  it('envoie les corps OpenAPI', () => {
    expect(toCreditBody({ amount: 50000.4, reason: ' Geste commercial ' })).toEqual({
      amount: 50000, reason: 'Geste commercial',
    });
    expect(toSuspendBody(' Contenu hors charte. ')).toEqual({ reason: 'Contenu hors charte.' });
    expect(toRejectBody('Profil incomplet.')).toEqual({ reason: 'Profil incomplet.' });
    expect(toRejectBody('')).toEqual({});
    expect(toScoresBody({ auth: 94.2, creat: 4.6, brief: 96, onTime: 98 })).toEqual({
      auth: 94, creat: 4.6, brief: 96, onTime: 98,
    });
    expect(toFlagBody(true)).toEqual({ value: true });
  });

  it('actions profils, crédit, flags, auto-validation et relance', async () => {
    expect(await rejectInfluencer('i10', 'Profil incomplet.')).toEqual({ message: 'Profil refusé.' });
    expect(await suspendInfluencer('i9', 'Contenu hors charte.')).toEqual({ message: 'Profil masqué.' });
    await expect(suspendInfluencer('i9', '  ')).rejects.toThrow('Indiquez le motif de la suspension.');
    expect(await certifyInfluencer('i1')).toEqual({ message: 'Ama Kouassi est maintenant certifié.' });
    expect(await updateInfluencerScores('i1', { auth: 95, creat: 4.7 })).toEqual({ message: 'Statistiques mises à jour.' });
    expect(await creditBrand('b1', { amount: 10000, reason: 'Geste SAV' })).toEqual({ message: '10 000 FCFA crédités.' });
    expect(await retryWithdrawal('w-fail')).toEqual({ message: 'Retrait relancé.' });
    await expect(retryWithdrawal('w1')).rejects.toThrow('Seuls les retraits échoués peuvent être relancés.');
    expect(await setFlag('v3', true)).toEqual({ message: 'V3 activée sur toute la plateforme.' });
    expect(await autoValidatePublished()).toEqual({ message: 'Aucune publication en attente de validation.' });
  });
});
