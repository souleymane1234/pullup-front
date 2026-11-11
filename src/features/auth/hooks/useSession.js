import { useQuery } from '@tanstack/react-query';
import { useAction } from '@/hooks/useAction.js';
import { saveFile } from '@/lib/browser.js';
import {
  deleteMyAccount, exportMyData, forgotPassword, getSession, login, logout, resetPassword, signupBrand, signupInfluencer,
} from '../api/auth.api.js';

/** @returns {{ session: import('@/services/auth.service.js').Session|null, role: 'visitor'|'brand'|'influencer'|'admin', isPending: boolean }} */
export function useSession() {
  const query = useQuery({
    queryKey: ['session'],
    queryFn: getSession,
    retry: false,
  });
  return { session: query.data ?? null, role: query.data?.role ?? 'visitor', isPending: query.isPending };
}

/** @param {(session: any) => void} [onDone] */
export function useLogin(onDone) {
  return useAction(login, { onSuccess: (data) => onDone?.(data.session) });
}

/** @param {() => void} [onDone] */
export function useLogout(onDone) {
  return useAction(() => logout(), { onSuccess: () => onDone?.() });
}

/** @param {() => void} [onDone] */
export function useSignupBrand(onDone) {
  return useAction(signupBrand, { onSuccess: () => onDone?.() });
}

/** @param {() => void} [onDone] */
export function useSignupInfluencer(onDone) {
  return useAction(signupInfluencer, { onSuccess: () => onDone?.() });
}

export function useForgotPassword() {
  return useAction(forgotPassword);
}

/** @param {() => void} [onDone] */
export function useResetPassword(onDone) {
  return useAction(resetPassword, { onSuccess: () => onDone?.() });
}

/** @param {() => void} [onDone] */
export function useDeleteAccount(onDone) {
  return useAction((password) => deleteMyAccount(password), { onSuccess: () => onDone?.() });
}

export function useExportMyData() {
  return useAction(async () => {
    const data = await exportMyData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveFile(`pullup-donnees-${new Date().toISOString().slice(0, 10)}.json`, blob);
    return { message: 'Vos données ont été téléchargées.' };
  });
}
