import { WebinarFormState } from '@/store/useWebinarStore';

export type ValidationErrors = Record<string, string>;

export type ValidationResult = {
  valid: boolean;
  errors: ValidationErrors;
};

export const validateBasicInfo = (data: {
  webinarName?: string;
  description?: string;
  date?: string;
  time?: string;
  timeFormat?: 'AM' | 'PM';
}): ValidationResult => {
  const errors: ValidationErrors = {};
  if (!data.webinarName?.trim()) {
    errors.webinarName = 'Webinar name is required';
  }
  if (!data.description?.trim()) {
    errors.description = 'Description is required';
  }
  if (!data.date?.trim()) {
    errors.date = 'Date is required';
  }
  if (!data.time?.trim()) {
    errors.time = 'Time is required';
  } else {
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]$/;
    if (!timeRegex.test(data.time)) {
      errors.time = 'Time must be in the format HH:MM (e.g., 10:30';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: errors,
  };
};
