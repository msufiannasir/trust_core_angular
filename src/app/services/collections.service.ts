import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CollectionsService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // Base API URL (Backend URL)

  constructor(private http: HttpClient) {}

  // Method to get collection data by handle
  getDynamicData(endpoint: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer 13|s9rFMB3eFl6wyxfVH3wfUF4W1k1qsyLo1f5nts1u0728d70e`, // Replace with the actual token dynamically
      'Content-Type': 'application/json',
    });

    // Combine base API URL with the endpoint (handle dynamic API calls)
    const fullUrl = `${this.apiUrl}${endpoint}`; // Full URL to the backend
    return this.http.get(fullUrl, { headers });
  }
}
