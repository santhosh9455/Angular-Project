import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from './app/services/loading-service';

export const LoadingInterceptor: HttpInterceptorFn = (req, next) => {

   console.log('Interceptor triggered for:', req.url); // Debug line
   
  const loadingService = inject(LoadingService);
  loadingService.show(); // start spinner

  return next(req).pipe(
    finalize(() => loadingService.hide()) // stop spinner
  );
};
