import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { routes } from './app.routes';
import { HttpTokenInterceptor } from './core/interceptors/http.token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Configuración básica que ya tenías
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // 👇 Necesario para poder usar interceptores
    provideHttpClient(withInterceptorsFromDi()),

    // 👇 Registro del interceptor
    { provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true },
  ],
};
