import { useEffect, useRef, useState } from 'react';

type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertCardProps {
  type: AlertType;
  message: string;
  onDismiss?: () => void;
  autoHideMs?: number | null;
}

export const AlertCard = ({
  type,
  message,
  onDismiss,
  autoHideMs = 5000, // default to 5 seconds
}: AlertCardProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  const wasVisibleRef = useRef(false);

  useEffect(() => {
    setIsVisible(true);
  }, [message]);

  useEffect(() => {
    if (autoHideMs == null || autoHideMs <= 0) {
      return undefined;
    }
    if (!isVisible) {
      return undefined;
    }
    const id = window.setTimeout(() => {
      setIsVisible(false);
    }, autoHideMs);
    return () => window.clearTimeout(id);
  }, [message, autoHideMs, isVisible]);

  useEffect(() => {
    if (wasVisibleRef.current && !isVisible) {
      const id = window.setTimeout(() => {
        onDismissRef.current?.();
      }, 200);
      return () => window.clearTimeout(id);
    }
    wasVisibleRef.current = isVisible;
  }, [isVisible]);

  return (
    <div
      className={`toast fixed top-4 right-4 z-50 pointer-events-none transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className={`alert alert-${type} pointer-events-auto`}>
        <span>{message}</span>
      </div>
    </div>
  );
};
