/* eslint-disable @typescript-eslint/no-explicit-any */
import { BASE_URL } from '@/api';
import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
  AxiosError,
  AxiosProgressEvent
} from 'axios';
import { toast, ToastOptions, Id } from 'react-toastify';


/**
 * Error response interface for standardized error handling
 */
export interface ApiErrorResponse {
  status: number;
  message: string;
  data: any;
}

/**
 * Interface for toast configuration
 */
export interface ToastConfig {
  enabled?: boolean;
  loading?: {
    message: string;
    options?: ToastOptions;
  };
  success?: {
    message: string;
    options?: ToastOptions;
  };
  error?: {
    message?: string; // Optional - will use server error message if not provided
    options?: ToastOptions;
  };
}

/**
 * Extended request config with toast configuration
 */
interface RequestConfigWithToast extends AxiosRequestConfig {
  toast?: ToastConfig;
}

/**
 * AxiosService - A common class for handling API requests
 * Includes configurations for authentication, file uploads,
 * request/response interceptors, and error handling
 */
class AxiosService {
  private instance: AxiosInstance;

  constructor(baseURL: string = BASE_URL) {
    this.instance = axios.create({
      baseURL,
      timeout: 30000, // 30 seconds default timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    this.setupInterceptors();
  }

  /**
   * Set the authentication token for all future requests
   * @param token - JWT or other auth token
   */
  public setAuthToken(token: string | null): void {
    if (token) {
      this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.instance.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Get the current auth token
   * @returns The current auth token or null if not set
   */
  public getAuthToken(): string | null {
    const authHeader = this.instance.defaults.headers.common['Authorization'] as string | undefined;
    return authHeader ? authHeader.replace('Bearer ', '') : null;
  }

  /**
   * Clear the authentication token
   */
  public clearAuthToken(): void {
    delete this.instance.defaults.headers.common['Authorization'];
  }

  /**
   * Upload a file with proper configuration
   * @param url - API endpoint
   * @param file - File to upload
   * @param additionalData - Additional form data
   * @param config - Additional config including toast options
   * @param onUploadProgress - Progress callback
   * @returns Axios promise
   */
  public uploadFile<T = any>(
    url: string,
    file: File | Blob | FormData,
    additionalData: Record<string, any> = {},
    config: RequestConfigWithToast = {},
    onUploadProgress?: (percentage: number, progressEvent: AxiosProgressEvent) => void
  ): Promise<T> {
    const formData = file instanceof FormData ? file : new FormData();

    // If file isn't already FormData, add it
    if (!(file instanceof FormData)) {
      formData.append('file', file);
    }

    // Add any additional form data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    // Prepare config with headers
    const requestConfig: RequestConfigWithToast = {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onUploadProgress ?
        (progressEvent: AxiosProgressEvent) => {
          const total = progressEvent.total ?? 0;
          const percentCompleted = total > 0 ? Math.round(
            (progressEvent.loaded * 100) / total
          ) : 0;
          onUploadProgress(percentCompleted, progressEvent);
        } : undefined
    };

    return this.request<T>('post', url, formData, requestConfig);
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Do something before request is sent
        // e.g., add timestamps, logging, etc.
        return config;
      },
      (error: AxiosError) => {
        // Do something with request error
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Any status code within the range of 2xx
        return response;
      },
      (error: AxiosError) => {
        // Handle different error scenarios
        if (error.response) {
          // Server responded with a status code outside of 2xx
          if (error.response.status === 401) {
            // Handle unauthorized/token expiry
            this.clearAuthToken();
            // You could trigger a logout action or refresh token here
          }

          // Return a standardized error format
          const apiError: ApiErrorResponse = {
            status: error.response.status,
            data: error.response.data,
            message: (error.response.data as any)?.message || 'An error occurred',
          };

          return Promise.reject(apiError);
        } else if (error.request) {
          // The request was made but no response was received
          const apiError: ApiErrorResponse = {
            status: 0,
            message: 'Network error - no response received',
            data: null,
          };

          return Promise.reject(apiError);
        } else {
          // Something happened in setting up the request
          const apiError: ApiErrorResponse = {
            status: 0,
            message: error.message || 'Request configuration error',
            data: null,
          };

          return Promise.reject(apiError);
        }
      }
    );
  }

  /**
   * Generic request method with toast handling
   */
  private request<T = any>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data?: any,
    config: RequestConfigWithToast = {}
  ): Promise<T> {
    let toastId: Id | null = null;
    const toastConfig = config.toast;

    // Show loading toast if configured
    if (toastConfig?.enabled && toastConfig.loading) {
      toastId = toast.loading(
        toastConfig.loading.message || 'Loading...',
        toastConfig.loading.options
      );
    }

    // check local storage for if authenticaion token is not set
    //commented below out because it is not needed
    // if (!this.getAuthToken()) {
    //   const authStorage = readLocalStorage("auth-storage");
    //   const auth = authStorage ? JSON.parse(authStorage).state : null;
    //   if (auth && auth.token && auth.isAuthenticated) {
    //     this.setAuthToken(auth.token);
    //   }
    // }

    // Make request
    let request: Promise<AxiosResponse<T>>;

    if (method === 'get' || method === 'delete') {
      request = this.instance[method]<T>(url, config);
    } else {
      request = this.instance[method]<T>(url, data, config);
    }

    // Handle response with toast
    return request
      .then(response => {
        // Show success toast if configured
        if (toastId && toastConfig?.success) {
          toast.update(toastId, {
            render: toastConfig.success.message,
            type: 'success',
            isLoading: false,
            ...toastConfig.success.options,
            autoClose: toastConfig.success.options?.autoClose ?? 3000
          });
        } else if (toastId) {
          toast.dismiss(toastId);
        }

        return response.data;
      })
      .catch(error => {
        console.log('Error:', error);
        console.log("sdsdsd: ", toastId && (toastConfig?.error || error.message) )
        // Show error toast if configured
        if (toastId && (toastConfig?.error || error.message)) {
          const errorMessage = (error as ApiErrorResponse).message || toastConfig?.error?.message ||
            'An error occurred';

          toast.update(toastId, {
            render: errorMessage,
            type: 'error',
            isLoading: false,
            position: 'top-right',
            autoClose: toastConfig?.error?.options?.autoClose ?? 3000
          });
        } else if (toastId) {
          toast.dismiss(toastId);
        }

        throw error;
      });
  }

  /**
   * Standard HTTP methods wrapping the axios instance with toast support
   */
  public get<T = any>(url: string, config: RequestConfigWithToast = {}): Promise<T> {
    return this.request<T>('get', url, undefined, config);
  }

  public post<T = any>(url: string, data: any = {}, config: RequestConfigWithToast = {}): Promise<T> {
    return this.request<T>('post', url, data, config);
  }

  public put<T = any>(url: string, data: any = {}, config: RequestConfigWithToast = {}): Promise<T> {
    return this.request<T>('put', url, data, config);
  }

  public patch<T = any>(url: string, data: any = {}, config: RequestConfigWithToast = {}): Promise<T> {
    return this.request<T>('patch', url, data, config);
  }

  public delete<T = any>(url: string, config: RequestConfigWithToast = {}): Promise<T> {
    return this.request<T>('delete', url, undefined, config);
  }
}

// Create and export an instance with default configuration
const apiService = new AxiosService();
export default apiService;