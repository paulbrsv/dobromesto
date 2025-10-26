export type FeedbackMode = 'add_place' | 'changes_request' | 'feedback';

export interface FeedbackPlaceOption {
  id: string;
  name: string;
}

export interface FeedbackRequestPayload {
  type: FeedbackMode;
  payload: Record<string, unknown>;
}

export interface BaseFeedbackFormValues {
  name?: string;
  email?: string;
  message?: string;
}

export interface AddPlaceFormValues {
  placeName: string;
  address: string;
  description: string;
  contact?: string;
  website?: string;
}

export interface ChangesRequestFormValues {
  placeId: string;
  changes: string;
  contact?: string;
}

export interface GenericFeedbackFormValues {
  name?: string;
  email?: string;
  message: string;
}

export type FeedbackFormValues =
  | ({ mode: 'add_place' } & AddPlaceFormValues)
  | ({ mode: 'changes_request' } & ChangesRequestFormValues)
  | ({ mode: 'feedback' } & GenericFeedbackFormValues);

export interface FeedbackSubmissionResult {
  success: boolean;
  message: string;
}

export const isFeedbackMode = (value: string | null | undefined): value is FeedbackMode =>
  value === 'add_place' || value === 'changes_request' || value === 'feedback';
