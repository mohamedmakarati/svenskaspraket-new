import { useEffect } from 'react';

/** Warn on tab close when form has unsaved changes (useBlocker requires data router). */
export function useUnsavedChanges(isDirty) {
  useEffect(() => {
    const handler = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  return null;
}

export function UnsavedChangesDialog() {
  return null;
}
