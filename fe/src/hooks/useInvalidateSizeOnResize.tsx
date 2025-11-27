import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export function useInvalidateSizeOnResize(deps: any[] = []) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize(false);
  }, deps);

  useEffect(() => {
    const container = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize(false));
    ro.observe(container);

    const onTransitionEnd = () => map.invalidateSize(false);
    document.addEventListener('transitionend', onTransitionEnd);
    window.addEventListener('resize', onTransitionEnd);

    const t = setTimeout(() => map.invalidateSize(false), 0);

    return () => {
      clearTimeout(t);
      ro.disconnect();
      document.removeEventListener('transitionend', onTransitionEnd);
      window.removeEventListener('resize', onTransitionEnd);
    };
  }, [map]);
}
