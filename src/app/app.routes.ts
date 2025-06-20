import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { RegistrationComponent } from './register/register';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './auth-guard';


export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'logout', redirectTo: 'login', pathMatch: 'full' },
];
