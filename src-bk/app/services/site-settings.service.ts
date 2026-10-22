import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SiteSettingsService {
  private apiUrl = environment.baseEndpoint;

  constructor(private http: HttpClient) {}

  getSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}settings`, { headers: this.createHeaders() });
  }

  updateSettings(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}settings`, formData, { headers: this.createHeaders(true) });
  }

  deleteField(fieldKey: string) {
    return this.http.delete(`${this.apiUrl}settings/${fieldKey}`, { headers: this.createHeaders(true) });
  }
  
  private createHeaders(isFileUpload: boolean = false): HttpHeaders {
    const authToken = localStorage.getItem('AuthToken');
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`
    });

    if (!isFileUpload) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return headers;
  }
}
