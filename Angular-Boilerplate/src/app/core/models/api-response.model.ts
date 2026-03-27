export interface ApiResponse<T> {
    success : boolean;
    message : string | null;
    data : T | null;

// Optional: Only populated if your Middleware catches ValidationExceptions
  validationErrors?: Record<string, string[]>;
}