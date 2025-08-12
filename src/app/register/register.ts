import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Navbar } from "../navbar/navbar";
import { ToastService } from '../services/toast.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';


@Component({
  selector: 'app-registration',
  standalone: true,
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  imports: [CommonModule, ReactiveFormsModule, Navbar]
})
export class RegistrationComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);

 registrationForm: FormGroup = this.fb.group({
  name: ['', Validators.required],
  dateOfBirth: ['', [Validators.required, Validators.min(18)]],
  gender: ['', Validators.required],
  email: [
    '',
    [
      Validators.required,
      Validators.pattern(/^[\w-\.]+@([\w-]+\.)+(com|in|edu)$/i)
    ]
  ],
  phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
  departmentId: ['', Validators.required],
  profileImage: [null, [Validators.required, imageFileValidator]],
  marksheetImage: [null, [Validators.required, imageFileValidator]]
});

  departments: any[] = []; // Load from backend
  successMessage = '';
  errorMessage = '';


showSwal(typeIcon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'success', title: string, text: string = '') {
    Swal.fire({
      title: title,
      text: text,
      icon: typeIcon,
      confirmButtonText: 'OK'
    });
  }

  onFileChange(event: any, field: 'profileImage' | 'marksheetImage') {
  const file: File = event.target.files[0];

  if (file) {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

    if (!allowedTypes.includes(file.type)) {
      alert('Only PNG, JPG or JPEG image files are allowed.');
      this.registrationForm.patchValue({ [field]: null });
      event.target.value = ''; // Clear the input
      return;
    }

    this.registrationForm.patchValue({ [field]: file });
  }
}

  constructor(private toast:ToastService) {
    // Initialize form and load departments
  }
ngOnInit(): void {
  this.http.get<any[]>('http://localhost:8080/dept/AllDept')
    .subscribe({
      next: (data) => this.departments = data,
      error: () => this.errorMessage = 'Failed to load departments'
    });
}

  onSubmit() {
    if (this.registrationForm.invalid) {
    this.registrationForm.markAllAsTouched(); // Show validation errors
    return;
  }
    if (this.registrationForm.valid) {
      const formData = new FormData();
      const values = this.registrationForm.value;

      formData.append('name', values.name);
      formData.append('dateOfBirth', values.dateOfBirth);
      formData.append('gender', values.gender);
      formData.append('email', values.email);
      formData.append('phoneNumber', values.phoneNumber);
      formData.append('departmentId', values.departmentId);
      formData.append('profileImage', values.profileImage);
      formData.append('marksheetImage', values.marksheetImage);
      console.log('Submitting form with data:', this.registrationForm.value);


      this.http.post('http://localhost:8080/api/students/registerRequest', formData).subscribe({
        next: () => {
          this.showSwal('success','Registration successfull!','Your Registration successfully sent to HOD...')
          this.registrationForm.reset();
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Registration failed:', err);
          this.showSwal('error','Registration failed:',err);
        }
      });
    }
  }
}

import { AbstractControl, ValidationErrors } from '@angular/forms';

export function imageFileValidator(control: AbstractControl): ValidationErrors | null {
  const file = control.value;

  if (file) {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

    if (!(file instanceof File)) {
      return { invalidType: true };
    }

    if (!allowedTypes.includes(file.type)) {
      return { invalidType: true };
    }
  }
  return null;
}
