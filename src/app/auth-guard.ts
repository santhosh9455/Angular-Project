import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';


export const authGuard: CanActivateFn = (route, state) => {
 const token = localStorage.getItem('authToken');
  if (token) return true;
  return inject(Router).navigate(['/login']).then(() => false);
};
