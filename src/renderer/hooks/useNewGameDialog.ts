import { useCallback, useState } from 'react';

export const useNewGameDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = useCallback(() => setIsOpen(false), []);
  const handleOpen = () => setIsOpen(true);

  return {
    isOpen,
    handleClose,
    handleOpen,
  };
};
