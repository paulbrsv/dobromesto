import React from 'react';
import { styled } from 'styled-components';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 9999;
`;

const ModalContainer = styled.div`
  width: min(600px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  position: relative;

  @media (max-width: 600px) {
    width: 100%;
    max-height: 100%;
    border-radius: 12px;
    padding: 20px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  border: none;
  background: transparent;
  color: #333;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
`;

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Overlay role="dialog" aria-modal="true">
      <ModalContainer>
        <CloseButton type="button" aria-label="Закрыть" onClick={onClose}>
          ×
        </CloseButton>
        {children}
      </ModalContainer>
    </Overlay>
  );
};
