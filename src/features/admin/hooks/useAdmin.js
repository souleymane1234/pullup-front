import { useQuery } from '@tanstack/react-query';
import { useAction } from '@/hooks/useAction.js';
import {
  certifyInfluencer,
  createCatalogItem,
  creditBrand,
  getAdminCatalog,
  getAdminDashboard,
  hideCatalogItem,
  updateCatalogItem,
  getFinanceSummary,
  listAuditLog,
  listWithdrawals,
  rejectInfluencer,
  retryWithdrawal,
  suspendInfluencer,
  updateInfluencerScores,
  verifyInfluencer,
} from '../api/admin.api.js';

export function useAdminDashboard() {
  return useQuery({ queryKey: ['admin'], queryFn: getAdminDashboard, retry: false });
}

export function useFinanceSummary(enabled) {
  return useQuery({ queryKey: ['admin', 'finance'], queryFn: getFinanceSummary, enabled, retry: false });
}

/** @param {string} status @param {boolean} enabled */
export function useWithdrawals(status, enabled) {
  return useQuery({
    queryKey: ['admin', 'withdrawals', status],
    queryFn: () => listWithdrawals(status),
    enabled,
    retry: false,
  });
}

/** @param {{ actor: string, target: string }} filters @param {boolean} enabled */
export function useAuditLog(filters, enabled) {
  return useQuery({
    queryKey: ['admin', 'audit', filters],
    queryFn: () => listAuditLog(filters),
    enabled,
    retry: false,
  });
}

export function useVerifyInfluencer() {
  return useAction(verifyInfluencer);
}

export function useRejectInfluencer() {
  return useAction(({ id, reason }) => rejectInfluencer(id, reason));
}

export function useSuspendInfluencer() {
  return useAction(({ id, reason }) => suspendInfluencer(id, reason));
}

export function useCertifyInfluencer() {
  return useAction(certifyInfluencer);
}

export function useUpdateScores() {
  return useAction(({ id, ...scores }) => updateInfluencerScores(id, scores));
}

export function useRetryWithdrawal() {
  return useAction(retryWithdrawal);
}

export function useCreditBrand() {
  return useAction(({ id, amount, reason }) => creditBrand(id, { amount, reason }));
}

/** @param {boolean} enabled */
export function useAdminCatalog(enabled) {
  return useQuery({ queryKey: ['admin', 'catalog'], queryFn: getAdminCatalog, enabled, retry: false });
}

/** @param {{ onSuccess?: () => void }} [options] */
export function useCreateCatalogItem(options) {
  return useAction(createCatalogItem, options);
}

/** @param {{ onSuccess?: () => void }} [options] */
export function useUpdateCatalogItem(options) {
  return useAction(({ kind, key, ...input }) => updateCatalogItem(kind, key, input), options);
}

export function useHideCatalogItem() {
  return useAction(({ kind, key }) => hideCatalogItem(kind, key));
}
