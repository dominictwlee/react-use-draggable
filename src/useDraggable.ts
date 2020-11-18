import React, { useCallback, useEffect, useRef, useState } from 'react';

const MOUSE_LEFT_BUTTON = 0;

enum DragState {
  IDLE = 'idle',
  DRAGGING = 'dragging',
}

type EventType = 'mouse' | 'touch';

export default function useDraggable<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const eventType = useRef<EventType>('mouse');

  const [lastX, setLastX] = useState<number | null>(null);
  const [lastY, setLastY] = useState<number | null>(null);
  const [dragState, setDragState] = useState<DragState>(DragState.IDLE);

  React.useEffect(() => {
    function preventBehavior(e: TouchEvent) {
      e.preventDefault();
    }
    if (dragState === DragState.DRAGGING) {
      document.addEventListener('touchstart', preventBehavior, {
        passive: false,
      });
      document.addEventListener('touchmove', preventBehavior, {
        passive: false,
      });
    }

    return () => {
      document.removeEventListener('touchstart', preventBehavior);
      document.removeEventListener('touchmove', preventBehavior);
    };
  }, [dragState]);

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
    (clientX: number, clientY: number) => {
      const { deltaX, deltaY } = calcDragDelta(clientX, clientY);
      setTranslateX(lastTranslateX.current + deltaX);
      setTranslateY(lastTranslateY.current + deltaY);
    },
    [calcDragDelta]
  );

  const handleMouseDrag = useCallback(
    (e: MouseEvent) => {
      if (dragState !== DragState.DRAGGING) {
        return;
      }
      handleDrag(e.clientX, e.clientY);
    },
    [dragState, handleDrag]
  );

  const handleTouchDrag = useCallback(
    (e: TouchEvent) => {
      if (dragState !== DragState.DRAGGING) {
        return;
      }
      const touch = e.touches[0];
      handleDrag(touch.clientX, touch.clientY);
    },
    [dragState, handleDrag]
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
    if (dragState === DragState.DRAGGING) {
      switch (eventType.current) {
        case 'mouse':
          document.addEventListener('mousemove', handleMouseDrag);
          break;
        case 'touch':
          document.addEventListener('touchmove', handleTouchDrag);
          break;
        default:
          break;
      }
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseDrag);
      document.removeEventListener('touchmove', handleTouchDrag);
    };
  }, [dragState, handleDrag, handleMouseDrag, handleTouchDrag]);

  const handleDragStart = useCallback(
    (clientX: number, clientY: number, node: T) => {
      const offsetParent = node.offsetParent || node.ownerDocument.body;

      const isBody = offsetParent === offsetParent.ownerDocument.body;
      const offsetParentRect = isBody
        ? { left: 0, top: 0 }
        : offsetParent.getBoundingClientRect();

      setDragState(DragState.DRAGGING);
      setLastX(clientX + offsetParent.scrollLeft - offsetParentRect.left);
      setLastY(clientY + offsetParent.scrollTop - offsetParentRect.top);
    },
    []
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const node = ref.current;
      if (e.button !== MOUSE_LEFT_BUTTON || !node) {
        return;
      }
      eventType.current = 'mouse';
      handleDragStart(e.clientX, e.clientY, node);
    },
    [handleDragStart]
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const node = ref.current;
      if (!node) {
        return;
      }
      eventType.current = 'touch';
      const touch = e.touches[0];
      handleDragStart(touch.clientX, touch.clientY, node);
    },
    [handleDragStart]
  );

  return {
    ref,
    onMouseDown,
    onTouchStart,
    onMouseUp: handleDragEnd,
    onTouchEnd: handleDragEnd,
    style: { transform: `translate(${translateX}px, ${translateY}px)` },
  };
}
