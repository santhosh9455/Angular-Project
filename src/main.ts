import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { routes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptorFn } from './AuthInterceptor';
import { LoadingInterceptor } from './loading.interceptor';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([AuthInterceptorFn, LoadingInterceptor])),
    provideCharts(withDefaultRegisterables()) // ← essential for ng2-charts
  ]
});
