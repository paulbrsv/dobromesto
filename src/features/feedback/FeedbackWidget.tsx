import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { styled } from 'styled-components';
import { fetchPlaces, submitFeedback } from './api';
import { FeedbackMode, FeedbackPlaceOption, FeedbackRequestPayload } from './types';
import { FeedbackForm } from './components/FeedbackForm';
import { FeedbackModeTabs } from './components/FeedbackModeTabs';
import { FeedbackToast } from './components/FeedbackToast';

interface FeedbackWidgetProps {
  initialMode?: FeedbackMode;
  onClose?: () => void;
  title?: string;
}

interface ToastState {
  message: string;
  variant: 'success' | 'error' | 'info';
}

const WidgetContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const WidgetHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const WidgetTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f1f1f;
`;

const WidgetSubtitle = styled.p`
  margin: 0;
  color: #5c5f66;
  font-size: 14px;
`;

const getSubtitle = (mode: FeedbackMode) => {
  switch (mode) {
    case 'add_place':
      return 'Поделитесь новым местом, которое должно появиться на карте.';
    case 'changes_request':
      return 'Сообщите, что стоит обновить в уже опубликованных местах.';
    case 'feedback':
    default:
      return 'Оставьте отзыв или идею — мы читаем каждое сообщение.';
  }
};

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  initialMode = 'add_place',
  onClose,
  title = 'Добавить место',
}) => {
  const [mode, setMode] = useState<FeedbackMode>(initialMode);
  const [places, setPlaces] = useState<FeedbackPlaceOption[]>([]);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [isPlacesLoading, setIsPlacesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const loadPlaces = useCallback(async () => {
    setIsPlacesLoading(true);
    setPlacesError(null);
    try {
      const loadedPlaces = await fetchPlaces();
      setPlaces(loadedPlaces);
    } catch (error) {
      setPlacesError('Не удалось загрузить список мест. Попробуйте позже.');
      console.error(error);
    } finally {
      setIsPlacesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mode === 'changes_request') {
      loadPlaces();
    }
    setSubmitError(null);
    setToast(null);
  }, [mode, loadPlaces]);

  useEffect(() => {
    setMode(initialMode);
    setSubmitError(null);
    setToast(null);
  }, [initialMode]);

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const payload: FeedbackRequestPayload = {
          type: mode,
          payload: { ...values },
        };
        await submitFeedback(payload);
        setToast({ message: 'Спасибо! Мы получили сообщение и скоро свяжемся с вами.', variant: 'success' });
        if (mode !== 'feedback') {
          onClose?.();
        }
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : 'Не удалось отправить форму';
        setSubmitError(message);
        setToast({ message, variant: 'error' });
        throw error instanceof Error ? error : new Error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [mode, onClose]
  );

  const subtitle = useMemo(() => getSubtitle(mode), [mode]);

  return (
    <WidgetContainer>
      <WidgetHeader>
        <WidgetTitle>{title}</WidgetTitle>
        <WidgetSubtitle>{subtitle}</WidgetSubtitle>
      </WidgetHeader>

      <FeedbackModeTabs activeMode={mode} onModeChange={setMode} />

      <FeedbackForm
        mode={mode}
        places={places}
        isPlacesLoading={isPlacesLoading}
        placesError={placesError}
        onSubmit={handleSubmit}
        submitError={submitError}
        isSubmitting={isSubmitting}
      />

      {toast && (
        <FeedbackToast
          variant={toast.variant}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </WidgetContainer>
  );
};
