import React, { useEffect } from 'react';
import { styled } from 'styled-components';

type ToastVariant = 'success' | 'error' | 'info';

interface FeedbackToastProps {
  variant: ToastVariant;
  message: string;
  onClose: () => void;
  duration?: number;
}

const ToastContainer = styled.div<{ $variant: ToastVariant }>`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 20px;
  border-radius: 8px;
  color: #fff;
  background: ${({ $variant }) =>
    $variant === 'success' ? '#2e7d32' : $variant === 'error' ? '#c62828' : '#2a3eb1'};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 999999;
  max-width: 320px;
  line-height: 1.4;
  font-size: 14px;
`;

export const FeedbackToast: React.FC<FeedbackToastProps> = ({
  variant,
  message,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <ToastContainer role="status" aria-live="polite" $variant={variant}>
      {message}
    </ToastContainer>
  );
};
