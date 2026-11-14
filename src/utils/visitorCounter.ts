import { useState, useEffect } from 'react';

const COUNTER_KEY = 'fun_grammar_game_alkhonaizi_worldwide_v1';
const API_BASE = 'https://countapi.mileshilliard.com/api/v1';
const STORAGE_KEY = 'fgg_worldwide_visits_cache';
const SESSION_KEY = 'fgg_session_counted';

/**
 * Hook to track and fetch the number of times the game page is visited worldwide.
 * Uses sessionStorage to prevent duplicate counts during rapid tab refreshes in the same session,
 * and localStorage cache for offline/instant initial rendering.
 */
export function useWorldwideVisits(): number | null {
  const [visits, setVisits] = useState<number | null>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      return cached ? parseInt(cached, 10) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let isMounted = true;

    async function recordVisit() {
      try {
        const hasSessionHit = sessionStorage.getItem(SESSION_KEY) === 'true';
        const endpoint = hasSessionHit
          ? `${API_BASE}/get/${COUNTER_KEY}`
          : `${API_BASE}/hit/${COUNTER_KEY}`;

        const res = await fetch(endpoint, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const count = typeof data.value === 'number' ? data.value : parseInt(data.value, 10);

        if (!isNaN(count) && isMounted) {
          sessionStorage.setItem(SESSION_KEY, 'true');
          localStorage.setItem(STORAGE_KEY, String(count));
          setVisits(count);
        }
      } catch (err) {
        console.warn('Could not fetch worldwide visit counter:', err);
        if (isMounted && visits === null) {
          try {
            const cached = localStorage.getItem(STORAGE_KEY);
            if (cached) setVisits(parseInt(cached, 10));
          } catch {
            // Ignore
          }
        }
      }
    }

    recordVisit();

    return () => {
      isMounted = false;
    };
  }, []);

  return visits;
}
