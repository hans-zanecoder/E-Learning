import Swal from 'sweetalert2';

export const swalConfirm = async (options?: {
  title?: string;
  text?: string;
  icon?: 'warning' | 'error' | 'success' | 'info' | 'question';
  confirmButtonText?: string;
  cancelButtonText?: string;
}) => {
  const result = await Swal.fire({
    title: options?.title || 'Are you sure?',
    text: options?.text || "You won't be able to revert this!",
    icon: options?.icon || 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: options?.confirmButtonText || 'Yes',
    cancelButtonText: options?.cancelButtonText || 'Cancel',
  });

  return result.isConfirmed;
};

export const swalSuccess = async (options?: {
  title?: string;
  text?: string;
  timer?: number;
  showConfirmButton?: boolean;
}) => {
  await Swal.fire({
    title: options?.title || 'Success!',
    text: options?.text,
    icon: 'success',
    timer: options?.timer || 1500,
    showConfirmButton: options?.showConfirmButton ?? false,
  });
};

export const swalError = async (
  error: any,
  options?: {
    title?: string;
    defaultMessage?: string;
  }
) => {
  await Swal.fire({
    title: options?.title || 'Error!',
    text: error?.message || options?.defaultMessage || 'An error occurred',
    icon: 'error',
    confirmButtonText: 'OK',
  });
};

export const swalValidationError = async (message: string) => {
  await Swal.fire({
    title: 'Validation Error',
    text: message,
    icon: 'error',
    confirmButtonText: 'OK',
  });
};
