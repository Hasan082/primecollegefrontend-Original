type ApiResponse<T> = {
  data?: {
    success?: boolean;
    message?: string;
    data?: T;
  };
};

type HandleOptions<T> = {
  data: ApiResponse<T> | null;
  error: string | null;
  onSuccess?: (data: ApiResponse<T>) => void;
  onError?: (error: string) => void;
  successMessage?: string;
};

export const handleResponse = <T>({
  data,
  error,
  onSuccess,
  onError,
  successMessage,
}: HandleOptions<T>) => {
  // ✅ Success case
  if (!error && data?.data?.success) {
    onSuccess?.(data);

    return {
      type: "success",
      message: data?.data?.message || successMessage || "Operation successful",
    };
  }

  // ❌ Error case
  const message =
    data?.data?.message || error || "Something went wrong, try again";

  onError?.(message);

  return {
    type: "error",
    message,
  };
};
