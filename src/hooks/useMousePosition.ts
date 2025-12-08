import { useState, useEffect, RefObject } from 'react';

interface MousePosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
}

export const useMousePosition = (ref?: RefObject<HTMLElement>) => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (ref?.current) {
        const rect = ref.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setMousePosition({
          x,
          y,
          normalizedX: (x / rect.width) * 2 - 1,
          normalizedY: (y / rect.height) * 2 - 1,
        });
      } else {
        setMousePosition({
          x: event.clientX,
          y: event.clientY,
          normalizedX: (event.clientX / window.innerWidth) * 2 - 1,
          normalizedY: (event.clientY / window.innerHeight) * 2 - 1,
        });
      }
    };

    const element = ref?.current || window;
    element.addEventListener('mousemove', handleMouseMove as any);
    return () => element.removeEventListener('mousemove', handleMouseMove as any);
  }, [ref]);

  return mousePosition;
};
