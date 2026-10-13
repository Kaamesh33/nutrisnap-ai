import { useCallback, useEffect, useState } from 'react';

/**
 * Tiny hash router. URLs look like  /#/diary?date=2026-10-13
 * Hash URLs work on GitHub Pages without any server configuration,
 * and refreshing the page never gives a 404.
 */

export type RouteName = 'home' | 'scan' | 'diary' | 'edit' | 'progress' | 'coach' | 'profile';

export interface Route {
  name: RouteName;
  /** e.g. the meal id for "edit" */
  param: string | null;
  query: URLSearchParams;
}

export function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, '');
  const [pathPart, queryPart = ''] = clean.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  const query = new URLSearchParams(queryPart);
  const first = segments[0] ?? '';
  switch (first) {
    case '':
      return { name: 'home', param: null, query };
    case 'scan':
    case 'diary':
    case 'progress':
    case 'coach':
    case 'profile':
      return { name: first, param: null, query };
    case 'edit':
      return segments[1] ? { name: 'edit', param: decodeURIComponent(segments[1]), query } : { name: 'diary', param: null, query };
    default:
      return { name: 'home', param: null, query };
  }
}

export function href(path: string): string {
  return `#/${path.replace(/^\//, '')}`;
}

export function navigate(path: string): void {
  window.location.hash = href(path);
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  const onChange = useCallback(() => {
    setRoute(parseHash(window.location.hash));
    window.scrollTo({ top: 0 });
  }, []);
  useEffect(() => {
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, [onChange]);
  return route;
}
