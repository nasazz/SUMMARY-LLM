import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/api-response.model'; // Import your interface

export function parseHttpError(err: HttpErrorResponse): string {
  // 1. Network / Connection Errors (Server down, No Internet, CORS block)
  if (err.status === 0) {
    return 'Network error. Please check your internet connection or server status.';
  }

  // 2. Try to extract the custom ApiResponse from the body
  const apiResponse = err.error as ApiResponse<any>;

  // 3. Scenario A: Backend returned a clean ApiResponse (Most Common)
  // This covers Controller 'Result.Fail' AND Middleware exceptions
  if (apiResponse && apiResponse.message) {
    return apiResponse.message;
  }

  // 4. Scenario B: Validation Errors (Special Case)
  // If your ApiResponse has the dictionary but no main message, pick the first error
  if (apiResponse && apiResponse.validationErrors) {
    const firstField = Object.keys(apiResponse.validationErrors)[0];
    if (firstField) {
      // Returns "Email: Invalid email format"
      return `${firstField}: ${apiResponse.validationErrors[firstField][0]}`;
    }
    return 'Validation failed. Please check the form.';
  }

  // 5. Scenario C: Standard HTTP Fallbacks (e.g. IIS / Kestrel errors outside your app)
  switch (err.status) {
    case 400:
      return 'Bad Request. The server could not understand the request.';
    case 401:
      return 'Unauthorized. Please login again.';
    case 403:
      return 'Forbidden. You do not have permission to perform this action.';
    case 404:
      return 'Resource not found.';
    case 500:
      return 'Internal Server Error. Please try again later.';
    default:
      // 6. Final Fallback: Use the raw HTTP message
      return err.message || 'An unexpected error occurred.';
  }
}