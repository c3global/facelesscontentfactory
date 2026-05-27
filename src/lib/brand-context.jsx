// Multi-brand state. Owns the list of the user's brands, the currently
// active brand (persisted in localStorage), and the CRUD wrappers that keep
// local state in sync with Supabase.
//
// Mounted inside the authenticated AppShell so every route can read or
// switch brands via the useBrands() hook.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase.js';
import {
  listBrands,
  createBrand as apiCreateBrand,
  updateBrand as apiUpdateBrand,
  deleteBrand as apiDeleteBrand,
} from './api.js';

const STORAGE_KEY = 'cadence:activeBrandId';
const BrandContext = createContext(null);

export function BrandProvider({ children }) {
  const [hasSession, setHasSession] = useState(false);
  const [brands, setBrands] = useState([]);
  const [activeBrandId, _setActiveBrandId] = useState(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(STORAGE_KEY) || null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track auth so we can refresh the brand list whenever the user signs in
  // or out. Hook lives here so the provider is fully self-contained and can
  // sit above App.jsx in the tree.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setHasSession(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const setActiveBrandId = useCallback((id) => {
    _setActiveBrandId(id);
    if (typeof window === 'undefined') return;
    if (id) window.localStorage.setItem(STORAGE_KEY, id);
    else window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const refresh = useCallback(async () => {
    if (!hasSession) {
      setBrands([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await listBrands();
      setBrands(list);
      // Pin activeBrandId to a real brand
      _setActiveBrandId((cur) => {
        if (cur && list.some((b) => b.id === cur)) return cur;
        const fallback = list[0]?.id || null;
        if (typeof window !== 'undefined') {
          if (fallback) window.localStorage.setItem(STORAGE_KEY, fallback);
          else window.localStorage.removeItem(STORAGE_KEY);
        }
        return fallback;
      });
    } catch (e) {
      // Most likely cause pre-migration: relation public.brands doesn't exist.
      // Degrade gracefully — the rest of the app keeps working in single-brand
      // mode and we surface the actionable message in the Brand Hub.
      const msg = String(e.message || e);
      if (/relation .* does not exist|brands.* does not exist/i.test(msg)) {
        setError('migration-needed');
      } else {
        setError(msg);
      }
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, [hasSession]);

  useEffect(() => { refresh(); }, [refresh]);

  const createBrand = useCallback(async (input) => {
    const b = await apiCreateBrand(input);
    setBrands((prev) => [...prev, b]);
    setActiveBrandId(b.id);
    return b;
  }, [setActiveBrandId]);

  const updateBrand = useCallback(async (id, patch) => {
    const b = await apiUpdateBrand(id, patch);
    setBrands((prev) => prev.map((x) => (x.id === id ? b : x)));
    return b;
  }, []);

  const deleteBrand = useCallback(async (id) => {
    await apiDeleteBrand(id);
    setBrands((prev) => {
      const next = prev.filter((x) => x.id !== id);
      if (activeBrandId === id) {
        const fallback = next[0]?.id || null;
        setActiveBrandId(fallback);
      }
      return next;
    });
  }, [activeBrandId, setActiveBrandId]);

  const activeBrand = useMemo(
    () => brands.find((b) => b.id === activeBrandId) || null,
    [brands, activeBrandId]
  );

  const value = {
    brands,
    activeBrand,
    activeBrandId,
    setActiveBrandId,
    refresh,
    createBrand,
    updateBrand,
    deleteBrand,
    loading,
    error,
  };

  return (
    <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
  );
}

export function useBrands() {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error('useBrands must be used within BrandProvider');
  return ctx;
}
