import { isAxiosError } from 'axios';

export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const data = error.response?.data as {
      message?: string;
      errors?: { msg: string }[];
    };
    if (data?.errors?.length) {
      return data.errors[0].msg;
    }
    return data?.message || error.message;
  }
  if (error instanceof Error) return error.message;
  return 'An error occurred';
};
