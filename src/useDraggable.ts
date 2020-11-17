import React, { useCallback, useEffect, useRef, useState } from 'react';

const MOUSE_LEFT_BUTTON = 0;

enum DragState {
  IDLE = 'idle',
  DRAGGING = 'dragging',
}

export default function useDraggable<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  const [lastX, setLastX] = useState<number | null>(null);
  const [lastY, setLastY] = useState<number | null>(null);
  const [dragState, setDragState] = useState<DragState>(DragState.IDLE);

  const calcDragDelta = useCallback(
    (x: number, y: number) => {
      if (lastX === null || lastY === null) {
        return {
          deltaX: 0,
          deltaY: 0,
        };
      }

      return {
        deltaX: x - lastX,
        deltaY: y - lastY,
      };
    },
    [lastX, lastY]
  );

  const handleDrag = useCallback(
    (e: MouseEvent) => {
      if (dragState !== DragState.DRAGGING) {
        return;
      }
      const { deltaX, deltaY } = calcDragDelta(e.clientX, e.clientY);
      setTranslateX(lastTranslateX.current + deltaX);
      setTranslateY(lastTranslateY.current + deltaY);
    },
    [calcDragDelta, dragState]
  );

  const handleDragEnd = useCallback(() => {
    if (dragState !== DragState.DRAGGING) {
      return;
    }
    setDragState(DragState.IDLE);
    lastTranslateX.current = translateX;
    lastTranslateY.current = translateY;
  }, [dragState, translateX, translateY]);

  useEffect(() => {
    const node = ref.current;
    if (dragState === DragState.DRAGGING) {
      node?.ownerDocument.addEventListener('mousemove', handleDrag);
    }
    return () => {
      node?.ownerDocument.removeEventListener('mousemove', handleDrag);
    };
  }, [dragState, handleDrag]);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    const node = ref.current;
    if (e.button !== MOUSE_LEFT_BUTTON || !node) {
      return;
    }
    const offsetParent = node.offsetParent || node.ownerDocument.body;

    const isBody = offsetParent === offsetParent.ownerDocument.body;
    const offsetParentRect = isBody
      ? { left: 0, top: 0 }
      : offsetParent.getBoundingClientRect();

    setDragState(DragState.DRAGGING);
    setLastX(e.clientX + offsetParent.scrollLeft - offsetParentRect.left);
    setLastY(e.clientY + offsetParent.scrollTop - offsetParentRect.top);
  }, []);

  console.log({ translateX, translateY, lastX, lastY });

  return {
    ref,
    onMouseDown: handleDragStart,
    onMouseUp: handleDragEnd,
    style: { transform: `translate(${translateX}px, ${translateY}px)` },
  };
}
