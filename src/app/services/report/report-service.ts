import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

   private baseUrl = 'http://localhost:8080/admin/report/students';

  constructor(private http: HttpClient) {}

    downloadReport(
    type: 'pdf' | 'excel' | 'csv',
    fullDownload: boolean = false,
    filters: { search?: string; departmentId?: number; status?: string } = {},
    page: number = 0,
    size: number = 10
  ) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.departmentId !== undefined && filters.departmentId !== null) {
      params = params.set('departmentId', filters.departmentId.toString());
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get(`${this.baseUrl}/${type}`, {
      params,
      responseType: 'blob'
    });
  }

  }
