import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { ToastService } from './toast.service';


interface LoginResponse {
  token?: string;
  message?: string;
  user?: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/auth';
  router = inject(Router);

  constructor(private toast:ToastService){}

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials, {
      headers,
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Login failed. Please try again.';
    
    // Try to get server error message if available
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      console.error('Client error:', error.error.message);
    } else {
      // Server-side error
      console.error(`Server error: ${error.status} - ${error.error?.message || error.message}`);
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

getUserRole(): string[] {
  const token = this.getToken();
  if (!token) return [];

  try {
    const decoded: any = jwtDecode(token);
    // console.log('Decoded JWT:', decoded);
    return decoded.authorities || []; // Your token has authorities field
  } catch (error) {
    console.error('JWT decode failed', error);
    return [];
  }
}

getUsername(): string | null {
  const token = this.getToken();
  if (!token) return null;

  try {
    const decodedToken: any = jwtDecode(token);
    return decodedToken.sub || null;  // 'sub' usually holds the username
  } catch (error) {
    console.error('JWT decode failed', error);
    return null;
  }
}

getAuthHeaders() {
  const token = this.getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
}


getWithAuth<T>(url: string) {
  return this.http.get<T>(url, {
    headers: new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`
    })
  });
}

postWithAuth<T>(url: string, body: any) {
  return this.http.post<T>(url, body, {
    headers: new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`
    })
  });
}


  storeToken(token: string): void {
    sessionStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return sessionStorage.getItem('authToken');
  }

  logout(): void {
    sessionStorage.removeItem('authToken');
    this.toast.showSuccess("Logout Successfully");
    this.router.navigate(['/login']); // navigate to login
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
    
  }
}

