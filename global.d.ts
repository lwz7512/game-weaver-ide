declare module '*.txt';

interface Window {
  /**
   * to block code running result tips, only list log result, false by default
   */
  DEBUG: boolean;
  /**
   * Clean up game resources usage
   * @returns
   */
  stopGame: () => void;
}
