import { useEffect } from 'react';

const useResizeHandleBar = (
  targeSelector: string,
  direction = 'v',
  onVerticalMove?: (deltaH: number) => void
) => {
  useEffect(() => {
    // Query the element
    const ele = document.querySelector(targeSelector) as HTMLElement;
    const handleBar = document.querySelector('.handle-bar') as HTMLElement;

    // The current position of mouse
    let x = 0;
    let y = 0;

    // The dimension of the element
    let w = 0;
    let h = 0;
    const clamp = (num: number, min: number, max: number) =>
      Math.min(Math.max(num, min), max);

    const mouseMoveHandler = (e: MouseEvent) => {
      // How far the mouse has been moved
      const dx = e.clientX - x;
      const dy = e.clientY - y;

      const min = 200;
      const max = 400;

      // Adjust the dimension of element
      if (direction === 'h') {
        const clampW = clamp(min, w - dx, max);
        ele.style.width = `${clampW}px`;
      }
      if (direction === 'v') {
        const clamH = clamp(min, h - dy, max);
        ele.style.height = `${clamH}px`;
        if (onVerticalMove) onVerticalMove(dy);
      }
    };

    const mouseUpHandler = () => {
      // Remove the handlers of `mousemove` and `mouseup`
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    // Handle the mousedown event
    // that's triggered when user drags the resizer
    const mouseDownHandler = (e: MouseEvent) => {
      // Get the current mouse position
      x = e.clientX;
      y = e.clientY;

      // Calculate the dimension of element
      const styles = window.getComputedStyle(ele);
      w = parseInt(styles.width, 10);
      h = parseInt(styles.height, 10);

      // Attach the listeners to `document`
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    };

    // add mousedown to handle bar
    handleBar.addEventListener('mousedown', mouseDownHandler);
  }, [targeSelector, direction, onVerticalMove]);
};

export default useResizeHandleBar;
