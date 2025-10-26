import { useCallback, useMemo, useRef, useState } from 'react';
import type { BaseSyntheticEvent, ChangeEvent } from 'react';

type Primitive = string | number | boolean | undefined | null | Date;

type ValidateResult = boolean | string | undefined;

type ValidateFunction = (value: any) => ValidateResult | Promise<ValidateResult>;

interface RegisterValidationRule {
  value: number | RegExp;
  message?: string;
}

export interface RegisterOptions<TFieldValue = Primitive> {
  required?: string | boolean;
  minLength?: RegisterValidationRule;
  maxLength?: RegisterValidationRule;
  pattern?: RegisterValidationRule;
  validate?: ValidateFunction;
  shouldUnregister?: boolean;
  valueAsNumber?: boolean;
  valueAsDate?: boolean;
  setValueAs?: (value: unknown) => TFieldValue;
}

export type FieldError = {
  type: string;
  message?: string;
};

export type FieldErrors<TFieldValues> = {
  [K in keyof TFieldValues]?: FieldError;
};

export type SubmitHandler<TFieldValues> = (
  data: TFieldValues,
  event?: BaseSyntheticEvent
) => void | Promise<void>;

export interface UseFormOptions<TFieldValues> {
  defaultValues?: Partial<TFieldValues>;
}

export interface UseFormReturn<TFieldValues> {
  register: (
    name: keyof TFieldValues & string,
    options?: RegisterOptions
  ) => {
    name: string;
    value: any;
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
  };
    handleSubmit: (
      onValid: SubmitHandler<TFieldValues>
    ) => (event?: BaseSyntheticEvent) => Promise<void>;
  reset: (values?: Partial<TFieldValues>) => void;
  setValue: (name: keyof TFieldValues & string, value: any) => void;
  getValues: () => TFieldValues;
  watch: (name?: keyof TFieldValues & string) => any;
  clearErrors: (name?: keyof TFieldValues & string) => void;
  setError: (name: keyof TFieldValues & string, error: FieldError) => void;
  formState: {
    errors: FieldErrors<TFieldValues>;
    isSubmitting: boolean;
    isValid: boolean;
  };
}

const getValueFromEvent = (
  event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  options?: RegisterOptions
) => {
  if (options?.setValueAs) {
    return options.setValueAs(event.target.value);
  }

  if (options?.valueAsNumber) {
    return Number(event.target.value);
  }

  if (options?.valueAsDate) {
    return new Date(event.target.value);
  }

  if (event.target.type === 'checkbox') {
    return (event.target as HTMLInputElement).checked;
  }

  return event.target.value;
};

const validateValue = async (
  value: any,
  options?: RegisterOptions
): Promise<FieldError | undefined> => {
  if (!options) {
    return undefined;
  }

  if (options.required) {
    const message = typeof options.required === 'string' ? options.required : 'Это обязательное поле';
    if (value === undefined || value === null || value === '') {
      return { type: 'required', message };
    }
  }

  if (options.minLength && typeof value === 'string' && value.length < Number(options.minLength.value)) {
    return { type: 'minLength', message: options.minLength.message };
  }

  if (options.maxLength && typeof value === 'string' && value.length > Number(options.maxLength.value)) {
    return { type: 'maxLength', message: options.maxLength.message };
  }

  if (options.pattern && typeof value === 'string') {
    const pattern = options.pattern.value;
    if (pattern instanceof RegExp && !pattern.test(value)) {
      return { type: 'pattern', message: options.pattern.message };
    }
  }

  if (options.validate) {
    const result = await options.validate(value);
    if (result !== true && result !== undefined) {
      return {
        type: 'validate',
        message: typeof result === 'string' ? result : 'Поле заполнено некорректно',
      };
    }
  }

  return undefined;
};

export function useForm<TFieldValues extends Record<string, any> = Record<string, any>>(
  options?: UseFormOptions<TFieldValues>
): UseFormReturn<TFieldValues> {
  const defaultValuesRef = useRef<Partial<TFieldValues>>(options?.defaultValues ?? {});
  const [values, setValues] = useState<TFieldValues>(
    () => ({ ...(options?.defaultValues ?? {}) } as TFieldValues)
  );
  const [errors, setErrors] = useState<FieldErrors<TFieldValues>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validatorsRef = useRef<Record<string, RegisterOptions | undefined>>({});

  const register = (
    name: keyof TFieldValues & string,
    validationOptions?: RegisterOptions
  ) => {
    validatorsRef.current[name] = validationOptions;

    const value = values[name as keyof TFieldValues];

    return {
      name,
      value: value ?? '',
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const nextValue = getValueFromEvent(event, validationOptions);
        setValues(prev => ({ ...prev, [name]: nextValue }));
        if (errors[name as keyof TFieldValues]) {
          setErrors(prev => ({ ...prev, [name]: undefined }));
        }
      },
      onBlur: () => {
        const currentValue = values[name as keyof TFieldValues];
        Promise.resolve(validateValue(currentValue, validationOptions)).then(error => {
          setErrors(prev => ({ ...prev, [name]: error }));
        });
      },
    };
  };

  const getValues = useCallback(() => values, [values]);

  const runValidation = useCallback(async () => {
    const newErrors: FieldErrors<TFieldValues> = {};
    await Promise.all(
      Object.entries(validatorsRef.current).map(async ([field, fieldOptions]) => {
        const error = await validateValue(values[field as keyof TFieldValues], fieldOptions);
        if (error) {
          newErrors[field as keyof TFieldValues] = error;
        }
      })
    );
    setErrors(newErrors);
    return newErrors;
  }, [values]);

  const handleSubmit = (onValid: SubmitHandler<TFieldValues>) => async (
    event?: BaseSyntheticEvent
  ) => {
    event?.preventDefault();
    const validationErrors = await runValidation();
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onValid(getValues(), event);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = (nextValues?: Partial<TFieldValues>) => {
    const merged = nextValues ?? defaultValuesRef.current;
    setValues({ ...(merged ?? {}) } as TFieldValues);
    setErrors({});
  };

  const setValue = (name: keyof TFieldValues & string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const watch = (name?: keyof TFieldValues & string) => {
    if (!name) {
      return values;
    }
    return values[name as keyof TFieldValues];
  };

  const clearErrors = (name?: keyof TFieldValues & string) => {
    if (!name) {
      setErrors({});
      return;
    }
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const setError = (name: keyof TFieldValues & string, error: FieldError) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const formState = useMemo(
    () => ({
      errors,
      isSubmitting,
      isValid: Object.keys(errors).length === 0,
    }),
    [errors, isSubmitting]
  );

  return {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    clearErrors,
    setError,
    formState,
  };
}
