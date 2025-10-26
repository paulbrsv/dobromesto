import { FeedbackMode, FeedbackPlaceOption, FeedbackRequestPayload } from './types';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    const message = errorText || `${response.status} ${response.statusText}`;
    throw new Error(message);
  }
  if (response.status === 204) {
    return null;
  }
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

export const fetchPlaces = async (): Promise<FeedbackPlaceOption[]> => {
  const response = await fetch('/places', {
    method: 'GET',
    headers: JSON_HEADERS,
  });
  const data = await handleResponse(response);
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data.map(item => ({
      id: String(item.id ?? item.slug ?? item.name ?? Math.random()),
      name: item.name ?? 'Unknown place',
    }));
  }

  if (data && typeof data === 'object' && Array.isArray((data as any).places)) {
    return (data as { places: any[] }).places.map(item => ({
      id: String(item.id ?? item.slug ?? item.name ?? Math.random()),
      name: item.name ?? 'Unknown place',
    }));
  }

  return [];
};

export const submitFeedback = async (
  payload: FeedbackRequestPayload
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch('/feedback', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(response);

  if (data && typeof data === 'object' && 'message' in data) {
    return { success: true, message: (data as any).message as string };
  }

  return { success: true, message: 'Спасибо! Мы получили ваш отклик.' };
};
