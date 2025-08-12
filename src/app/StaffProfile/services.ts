import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StaffProfile {
  id: number;
  name: string;
  email: string;
  age: number;
  gender: string;
  phoneNumber: string;
  role: string | null;
  username: string;
  subjectNme: string[];
  upSubjectName: string | null;
  courseId: number;
  subjectId: number[];
  departmentName: string;
  courseName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private apiUrl = 'http://localhost:8080/hod/profile'; // Your API endpoint

  constructor(private http: HttpClient) {}

  getProfile(): Observable<StaffProfile> {
    return this.http.get<StaffProfile>(this.apiUrl);
  }
}
