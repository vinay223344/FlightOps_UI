import { useEffect } from 'react';

/** Sets document.title to "<title> · FlightOps" while mounted. */
export function usePageTitle(title: string): void {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · FlightOps` : 'FlightOps';
    return () => {
      document.title = previous;
    };
  }, [title]);
}
