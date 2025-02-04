import Swal, { SweetAlertOptions } from 'sweetalert2';

interface SwalConfigCustomClass {
  popup?: string;
  title?: string;
  htmlContainer?: string;
  confirmButton?: string;
  cancelButton?: string;
  actions?: string;
  icon?: string;
  container?: string;
}

interface SwalConfig {
  customClass: SwalConfigCustomClass;
  buttonsStyling: boolean;
  background: string;
  showClass: {
    popup: string;
  };
  hideClass: {
    popup: string;
  };
  color: string;
  width: string;
  padding: string;
  backdrop: string;
  allowOutsideClick: boolean;
  stopKeydownPropagation: boolean;
  grow: boolean | 'row' | 'column' | 'fullscreen';
}

const modernSwalConfig: SweetAlertOptions = {
  customClass: {
    popup: 'rounded-2xl shadow-2xl border dark:border-gray-700 dark:bg-gray-800/95 backdrop-blur-sm w-[28rem]',
    title: 'text-xl text-gray-900 dark:text-white font-semibold mt-4',
    htmlContainer: 'text-gray-600 dark:text-gray-300 flex items-center justify-center py-4',
    confirmButton: 'w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 py-2.5 font-medium transition-all duration-200 shadow-lg shadow-purple-600/20',
    cancelButton: 'w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl px-6 py-2.5 font-medium transition-all duration-200',
    actions: 'space-x-3 mt-4 px-6 pb-6',
    icon: 'mb-2 text-purple-600 dark:text-purple-400',
    container: 'backdrop-blur-md',
  },
  buttonsStyling: false,
  background: 'rgb(255, 255, 255)',
  showClass: {
    popup: 'animate__animated animate__fadeInUp animate__faster'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOutDown animate__faster'
  },
  color: '#1f2937',
  width: '28rem',
  padding: '1.25rem',
  backdrop: 'backdrop-filter backdrop-blur-sm bg-gray-900/20',
  allowOutsideClick: false,
  stopKeydownPropagation: true,
  grow: false
};

export const swalConfirm = async (options?: {
  title?: string;
  text?: string;
  icon?: 'warning' | 'error' | 'success' | 'info' | 'question';
  confirmButtonText?: string;
  cancelButtonText?: string;
}) => {
  const result = await Swal.fire({
    ...modernSwalConfig,
    title: options?.title || 'Are you sure?',
    text: options?.text || "You won't be able to revert this!",
    icon: options?.icon || 'warning',
    showCancelButton: true,
    confirmButtonText: options?.confirmButtonText || 'Yes',
    cancelButtonText: options?.cancelButtonText || 'Cancel',
  } as SweetAlertOptions);

  return result.isConfirmed;
};

export const swalSuccess = async (options?: {
  title?: string;
  text?: string;
  timer?: number;
  showConfirmButton?: boolean;
}) => {
  await Swal.fire({
    ...modernSwalConfig,
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
    ...modernSwalConfig,
    title: options?.title || 'Error!',
    text: error?.message || options?.defaultMessage || 'An error occurred',
    icon: 'error',
    confirmButtonText: 'OK',
  });
};

export const swalValidationError = async (message: string) => {
  await Swal.fire({
    ...modernSwalConfig,
    title: 'Validation Error',
    text: message,
    icon: 'error',
    confirmButtonText: 'OK',
  });
};
