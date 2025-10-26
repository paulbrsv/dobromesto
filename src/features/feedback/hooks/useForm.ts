import { useCallback, useMemo, useRef, useState } from 'react';

type FieldValue = string;

type FieldError = {
  type: string;
  message?: string;
};

export interface RegisterOptions<TValue = FieldValue> {
  required?: boolean | string;
  minLength?: { value: number; message?: string };
  maxLength?: { value: number; message?: string };
  pattern?: { value: RegExp; message?: string };
  setValueAs?: (value: any) => TValue;
  shouldUnregister?: boolean;
}

export interface UseFormOptions<TFieldValues extends Record<string, FieldValue>> {
  defaultValues?: Partial<TFieldValues>;
}

export interface FormState<TFieldValues extends Record<string, FieldValue>> {
  errors: Partial<Record<keyof TFieldValues, FieldError>>;
  isSubmitting: boolean;
  isValid: boolean;
}

type SubmitHandler<TFieldValues extends Record<string, FieldValue>> = (
  values: TFieldValues,
  event?: React.BaseSyntheticEvent
) => void | Promise<void>;

type ExtractFieldName<TFieldValues> = Extract<keyof TFieldValues, string>;

const clone = <T,>(value: T): T => {
  try {
    return JSON.parse(JSON.stringify(value ?? {}));
  } catch (error) {
    return value;
  }
};

const isEmpty = (value: unknown) => value === undefined || value === null || value === '';

const resolveValue = (
  event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  options?: RegisterOptions
): FieldValue => {
  if (options?.setValueAs) {
    return options.setValueAs(event.target.value);
  }

  return event.target.value;
};

const validateValue = async (
  value: FieldValue,
  options?: RegisterOptions
): Promise<FieldError | undefined> => {
  if (!options) {
    return undefined;
  }

  if (options.required) {
    const message = typeof options.required === 'string' ? options.required : 'Поле заполнено некорректно';
    if (isEmpty(value)) {
      return { type: 'required', message };
    }
  }

  if (
    options.minLength &&
    typeof value === 'string' &&
    value.length < Number(options.minLength.value)
  ) {
    return {
      type: 'minLength',
      message: options.minLength.message || 'Поле заполнено некорректно',
    };
  }

  if (
    options.maxLength &&
    typeof value === 'string' &&
    value.length > Number(options.maxLength.value)
  ) {
    return {
      type: 'maxLength',
      message: options.maxLength.message || 'Поле заполнено некорректно',
    };
  }

  if (options.pattern && typeof value === 'string' && !options.pattern.value.test(value)) {
    return {
      type: 'pattern',
      message: options.pattern.message || 'Поле заполнено некорректно',
    };
  }

  return undefined;
};

export const useForm = <TFieldValues extends Record<string, FieldValue> = Record<string, FieldValue>>(
  options: UseFormOptions<TFieldValues> = {}
) => {
  const sanitise = (input: Partial<TFieldValues> = {}) => {
    return Object.entries(input).reduce<Record<string, FieldValue>>((acc, [key, value]) => {
      acc[key] = typeof value === 'string' ? value : '';
      return acc;
    }, {});
  };

  const defaultValuesRef = useRef<Record<string, FieldValue>>(sanitise(options.defaultValues));
  const valuesRef = useRef<Record<string, FieldValue>>(sanitise(options.defaultValues));
  const optionsRef = useRef<Record<string, RegisterOptions>>({});
  const touchedRef = useRef<Record<string, boolean>>({});

  const [errors, setErrors] = useState<FormState<TFieldValues>['errors']>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [, forceRender] = useState(0);

  const validateField = useCallback(
    async (name: string, value: FieldValue) => {
      const error = await validateValue(value, optionsRef.current[name]);

      setErrors(prevErrors => {
        const nextErrors = { ...prevErrors } as FormState<TFieldValues>['errors'];

        if (error) {
          nextErrors[name as ExtractFieldName<TFieldValues>] = error;
        } else {
          delete nextErrors[name as ExtractFieldName<TFieldValues>];
        }

        setIsValid(Object.keys(nextErrors).length === 0);
        return nextErrors;
      });
    },
    []
  );

  const register = useCallback(
    (name: ExtractFieldName<TFieldValues>, registerOptions: RegisterOptions = {}) => {
      optionsRef.current[name] = registerOptions;

      if (!(name in valuesRef.current)) {
        valuesRef.current[name] = defaultValuesRef.current[name] ?? '';
      }

      const handleBlur = async () => {
        touchedRef.current[name] = true;
        await validateField(name, valuesRef.current[name]);
      };

      const handleChange = async (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => {
        valuesRef.current[name] = resolveValue(event, optionsRef.current[name]);

        if (touchedRef.current[name]) {
          await validateField(name, valuesRef.current[name]);
        }

        forceRender(value => value + 1);
      };

      const value = valuesRef.current[name];

      return {
        name,
        value,
        onBlur: handleBlur,
        onChange: handleChange,
      } as const;
    },
    [validateField]
  );

  const handleSubmit = useCallback(
    (onValid: SubmitHandler<TFieldValues>) =>
      async (event?: React.BaseSyntheticEvent) => {
        if (event?.preventDefault) {
          event.preventDefault();
        }

        setIsSubmitting(true);

        const currentValues = clone(valuesRef.current) as TFieldValues;
        const nextErrors: FormState<TFieldValues>['errors'] = {};

        const fieldNames = Object.keys({
          ...defaultValuesRef.current,
          ...valuesRef.current,
        });

        for (const fieldName of fieldNames) {
          const maybeError = await validateValue(valuesRef.current[fieldName], optionsRef.current[fieldName]);
          if (maybeError) {
            nextErrors[fieldName as ExtractFieldName<TFieldValues>] = maybeError;
          }
        }

        setErrors(nextErrors);
        const hasErrors = Object.keys(nextErrors).length > 0;
        setIsValid(!hasErrors);

        try {
          if (!hasErrors) {
            await onValid(currentValues, event);
          }
        } finally {
          setIsSubmitting(false);
        }
      },
    []
  );

  const reset = useCallback((nextValues?: Partial<TFieldValues>) => {
    const source = nextValues ? sanitise(nextValues) : sanitise(defaultValuesRef.current as Partial<TFieldValues>);
    valuesRef.current = { ...source };
    touchedRef.current = {};
    setErrors({});
    setIsValid(true);
    forceRender(value => value + 1);
  }, []);

  const formState = useMemo<FormState<TFieldValues>>(
    () => ({
      errors,
      isSubmitting,
      isValid,
    }),
    [errors, isSubmitting, isValid]
  );

  return {
    register,
    handleSubmit,
    reset,
    formState,
  };
};

export type UseFormReturn<TFieldValues extends Record<string, FieldValue>> = ReturnType<
  typeof useForm<TFieldValues>
>;
