import React, { useEffect } from 'react';
import { styled } from 'styled-components';
import { useForm } from '../../../react-hook-form';
import { FeedbackMode, FeedbackPlaceOption } from '../types';

interface FeedbackFormProps {
  mode: FeedbackMode;
  places: FeedbackPlaceOption[];
  isPlacesLoading: boolean;
  placesError?: string | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  onSuccess?: () => void;
  onReloadPlaces?: () => void;
  submitError?: string | null;
  isSubmitting?: boolean;
}

interface FeedbackFormFields {
  placeName: string;
  address: string;
  description: string;
  contact: string;
  website: string;
  placeId: string;
  changes: string;
  name: string;
  email: string;
  message: string;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 14px;
  color: #333;
`;

const Input = styled.input`
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #d5d7db;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #3388ff;
    outline: none;
  }
`;

const Select = styled.select`
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #d5d7db;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #3388ff;
    outline: none;
  }
`;

const TextArea = styled.textarea`
  padding: 12px 14px;
  min-height: 120px;
  border-radius: 10px;
  border: 1px solid #d5d7db;
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #3388ff;
    outline: none;
  }
`;

const SubmitButton = styled.button<{ $loading?: boolean }>`
  border: none;
  border-radius: 12px;
  padding: 14px 18px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: ${({ $loading }) => ($loading ? '#7fa8ff' : '#3388ff')};
  cursor: ${({ $loading }) => ($loading ? 'wait' : 'pointer')};
  transition: background 0.2s ease;

  &:hover {
    background: ${({ $loading }) => ($loading ? '#7fa8ff' : '#2a6adf')};
  }
`;

const ErrorText = styled.span`
  color: #c62828;
  font-size: 12px;
`;

const HelperText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #666;
`;

const LoadingText = styled.p`
  margin: 0;
  font-size: 13px;
  color: #555;
`;

const RetryWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

const RetryButton = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #3388ff;
  background: transparent;
  color: #3388ff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  mode,
  places,
  isPlacesLoading,
  placesError,
  onSubmit,
  onSuccess,
  submitError,
  isSubmitting,
  onReloadPlaces,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormFields>({
    defaultValues: {
      placeName: '',
      address: '',
      description: '',
      contact: '',
      website: '',
      placeId: '',
      changes: '',
      name: '',
      email: '',
      message: '',
    },
  });

  useEffect(() => {
    reset({
      placeName: '',
      address: '',
      description: '',
      contact: '',
      website: '',
      placeId: '',
      changes: '',
      name: '',
      email: '',
      message: '',
    });
  }, [mode, reset]);

  const handleFormSubmit = handleSubmit(async data => {
    const trimmedData = Object.entries(data).reduce<Record<string, unknown>>((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = value.trim();
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});

    try {
      await onSubmit(trimmedData);
      onSuccess?.();
      reset();
    } catch (error) {
      // Ошибки обрабатываются родительским компонентом
    }
  });

  return (
    <Form onSubmit={handleFormSubmit} noValidate>
      {mode === 'add_place' && (
        <>
          <FieldGroup>
            <Label htmlFor="placeName">Название места *</Label>
            <Input
              id="placeName"
              placeholder="Например, Cafe Central"
              {...register('placeName', { required: 'Укажите название заведения' })}
            />
            {errors.placeName?.message && <ErrorText>{errors.placeName.message}</ErrorText>}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="address">Адрес *</Label>
            <Input
              id="address"
              placeholder="Улица, номер дома"
              {...register('address', { required: 'Нужно указать адрес' })}
            />
            {errors.address?.message && <ErrorText>{errors.address.message}</ErrorText>}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="description">Описание *</Label>
            <TextArea
              id="description"
              placeholder="Расскажите, что особенного в этом месте"
              {...register('description', {
                required: 'Добавьте описание',
                minLength: { value: 10, message: 'Описание должно содержать минимум 10 символов' },
              })}
            />
            {errors.description?.message && <ErrorText>{errors.description.message}</ErrorText>}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="contact">Контакт для связи</Label>
            <Input id="contact" placeholder="Телефон или социальные сети" {...register('contact')} />
            <HelperText>Необязательно, но помогает уточнить детали.</HelperText>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="website">Сайт</Label>
            <Input id="website" placeholder="https://" {...register('website')} />
          </FieldGroup>
        </>
      )}

      {mode === 'changes_request' && (
        <>
          <FieldGroup>
            <Label htmlFor="placeId">Место *</Label>
            {isPlacesLoading ? (
              <LoadingText>Загружаем список мест…</LoadingText>
            ) : (
              <>
                <Select
                  id="placeId"
                  defaultValue=""
                  {...register('placeId', { required: 'Выберите место' })}
                >
                  <option value="" disabled>
                    Выберите место для обновления
                  </option>
                  {places.map(place => (
                    <option key={place.id} value={place.id}>
                      {place.name}
                    </option>
                  ))}
                </Select>
                {errors.placeId?.message && <ErrorText>{errors.placeId.message}</ErrorText>}
                {placesError && (
                  <RetryWrapper>
                    <ErrorText role="alert">{placesError}</ErrorText>
                    {onReloadPlaces && (
                      <RetryButton type="button" onClick={onReloadPlaces} disabled={isPlacesLoading}>
                        {isPlacesLoading ? 'Повторяем…' : 'Повторить'}
                      </RetryButton>
                    )}
                  </RetryWrapper>
                )}
              </>
            )}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="changes">Что нужно обновить *</Label>
            <TextArea
              id="changes"
              placeholder="Опишите изменения, которые необходимо внести"
              {...register('changes', {
                required: 'Расскажите, что нужно обновить',
                minLength: { value: 5, message: 'Добавьте чуть больше деталей' },
              })}
            />
            {errors.changes?.message && <ErrorText>{errors.changes.message}</ErrorText>}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="contact">Контакт для уточнения</Label>
            <Input id="contact" placeholder="Телефон, e-mail или соцсети" {...register('contact')} />
          </FieldGroup>
        </>
      )}

      {mode === 'feedback' && (
        <>
          <FieldGroup>
            <Label htmlFor="name">Имя</Label>
            <Input id="name" placeholder="Как к вам обращаться" {...register('name')} />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              {...register('email', {
                pattern: {
                  value: /\S+@\S+\.\S+/, 
                  message: 'Укажите корректный e-mail',
                },
              })}
            />
            {errors.email?.message && <ErrorText>{errors.email.message}</ErrorText>}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="message">Сообщение *</Label>
            <TextArea
              id="message"
              placeholder="Поделитесь идеями и отзывами"
              {...register('message', {
                required: 'Сообщение не может быть пустым',
                minLength: { value: 5, message: 'Добавьте больше деталей' },
              })}
            />
            {errors.message?.message && <ErrorText>{errors.message.message}</ErrorText>}
          </FieldGroup>
        </>
      )}

      {submitError && <ErrorText role="alert">{submitError}</ErrorText>}

      <SubmitButton type="submit" $loading={isSubmitting} disabled={isSubmitting}>
        {isSubmitting ? 'Отправляем…' : 'Отправить'}
      </SubmitButton>
    </Form>
  );
};
