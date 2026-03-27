import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  ThunderboltFill,
  MinusOutline,
  PlusOutline,
  LeftOutline,
  RightOutline,
  UserAddOutline,
  ClockCircleOutline,
  CheckOutline
} from '@ant-design/icons-angular/icons';

registerLocaleData(en);

const icons = [
  ThunderboltFill,
  MinusOutline,
  PlusOutline,
  LeftOutline,
  RightOutline,
  UserAddOutline,
  ClockCircleOutline,
  CheckOutline
];

// Define custom Aura preset with Tailwind Blue colors
const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22'
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideNzIcons(icons),
    provideNzI18n(en_US),
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: false,
        }
      }
    })
  ]
};
