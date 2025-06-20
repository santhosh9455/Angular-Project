import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { Navbar } from "../navbar/navbar";
import { ToastService } from '../services/toast.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [CommonModule, ReactiveFormsModule, Navbar]
})
export class LoginComponent {
  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);

  constructor(private toast: ToastService) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  errorMessage: string = '';

  onSubmit() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (res) => {
          console.log("method calling", res);
          if (res.token) {
            this.authService.storeToken(res.token); // store token
             this.toast.showSuccess("Login successfully!");
            this.router.navigate(['/dashboard']);   // redirect
          } else {
            this.errorMessage = 'Invalid response from server';
          }
        },
        error: () => {
          this.errorMessage = 'Invalid username or password';
        }
      });
    }
  }
}
