import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Return to the top when the demo moves between routes. */
export function useScrollToTop(): void {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
}
