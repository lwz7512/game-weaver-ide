import { useEffect, useState } from 'react';

const useResizeHandleBar = (targeSelector: string, direction = 'v') => {
  const minSize = 200;
  const maxSize = 400;

  const [size, setSize] = useState('min');

  const switchHeightHandler = () => {
    const ele = document.querySelector(targeSelector) as HTMLElement;
    if (size === 'min') {
      setSize('max');
      ele.style.height = `${maxSize}px`;
    } else {
      setSize('min');
      ele.style.height = `${minSize}px`;
    }
  };

  useEffect(() => {
    // Query the element
    const ele = document.querySelector(targeSelector) as HTMLElement;
    const handleBar = document.querySelector('.handle-bar') as HTMLElement;
    const handleBarRow = document.querySelector(
      '.handle-bar-section'
    ) as HTMLElement;

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

      // Adjust the dimension of element
      if (direction === 'h') {
        const clampW = clamp(minSize, w - dx, maxSize);
        ele.style.width = `${clampW}px`;
      }
      if (direction === 'v') {
        const clamH = clamp(minSize, h - dy, maxSize);
        ele.style.height = `${clamH}px`;
        // if (onVerticalMove) onVerticalMove(dy);
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
    handleBarRow.addEventListener('mouseleave', mouseUpHandler);
  }, [targeSelector, direction]);

  return {
    size,
    switchHeightHandler,
  };
};

export default useResizeHandleBar;
