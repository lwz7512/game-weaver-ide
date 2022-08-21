import { useEffect } from 'react';

const useResizeHandleBar = (targeSelector: string) => {
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

    const mouseMoveHandler = (e: MouseEvent) => {
      // How far the mouse has been moved
      // const dx = e.clientX - x;
      const dy = e.clientY - y;

      // Adjust the dimension of element
      // ele.style.width = `${w + dx}px`;
      ele.style.height = `${h - dy}px`;
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
  }, [targeSelector]);
};

export default useResizeHandleBar;
