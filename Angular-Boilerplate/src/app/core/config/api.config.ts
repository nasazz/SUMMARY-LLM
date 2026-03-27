import { environment } from "../../../environments/environment";

export const API_CONFIG = {
  // This pulls 'https://localhost:../api' from environment file
  baseUrl: environment.apiUrl,

  endpoints: {
    auth: {
      // Result: https://localhost:../api/auth/login
      login: '/auth/login',

      // Result: https://localhost:../api/auth/register
      register: '/auth/register',
      me: '/auth/me',
    },
    // Future placeholders based on your  domain
    users: {
      getAll: '/users',
      getById: (id: string) => `/users/${id}`,
      update: (id: string) => `/users/${id}`,
      delete: (id: string) => `/users/${id}`,
    },
    reference: {
      plants: '/reference/plants',
      departments: '/reference/departments'
    }
  }
};
