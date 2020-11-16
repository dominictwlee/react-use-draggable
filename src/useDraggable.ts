import React, { useCallback, useEffect, useRef, useState } from 'react';

const MOUSE_LEFT_BUTTON = 0;

enum DragState {
  IDLE = 'idle',
  DRAGGING = 'dragging',
}

function calcCoordsData() {}

export default function useDraggable<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [lastX, setLastX] = useState<number | null>(null);
  const [lastY, setLastY] = useState<number | null>(null);
  const [dragState, setDragState] = useState<DragState>(DragState.IDLE);

  const calcCoordsData = useCallback(
    (x: number, y: number) => {
      if (lastX === null || lastY === null) {
        return {
          deltaX: 0,
          deltaY: 0,
          lastX: x,
          lastY: y,
          x,
          y,
        };
      }

      return {
        deltaX: x - lastX,
        deltaY: y - lastY,
        lastX,
        lastY,
        x,
        y,
      };
    },
    [lastX, lastY]
  );

  const handleDrag = useCallback(
    (e: MouseEvent) => {
      if (dragState !== DragState.DRAGGING) {
        return;
      }
      const { deltaX, deltaY } = calcCoordsData(e.clientX, e.clientY);
      setTranslateX(deltaX);
      setTranslateY(deltaY);
    },
    [calcCoordsData, dragState]
  );

  const handleDragEnd = () => {};

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
    style: { transform: `translate(${translateX}px, ${translateY}px)` },
  };
}