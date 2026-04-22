import { useState, useCallback, useRef } from 'react';

const useConfirm = () => {
  const [state, setState] = useState({ open: false, message: '' });
  const resolveRef = useRef(null);

  const confirm = useCallback((message) => {
    setState({ open: true, message });
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleYes = useCallback(() => {
    setState({ open: false, message: '' });
    resolveRef.current?.(true);
  }, []);

  const handleNo = useCallback(() => {
    setState({ open: false, message: '' });
    resolveRef.current?.(false);
  }, []);

  return { confirm, isOpen: state.open, message: state.message, handleYes, handleNo };
};

export default useConfirm;
