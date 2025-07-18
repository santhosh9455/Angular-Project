import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Navbar } from '../../navbar/navbar';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-department',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './department.html',
  styleUrls: ['./department.css']
})
export class Department {

  private http = inject(HttpClient);
  private authService = inject(AuthService); 

  departments: any[] = [];

  
}
