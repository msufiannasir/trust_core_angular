import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CollectionsService {
  private apiUrl = 'http://127.0.0.1:8000/api/collections/show'; // Your API URL

  constructor(private http: HttpClient) {}

  // Method to get collection data by ID
  getCollectionById(id: number): Observable<any> {
    // Create the Authorization header with Bearer token and Content-Type application/json
    const headers = new HttpHeaders({
      'Authorization': `Bearer 13|s9rFMB3eFl6wyxfVH3wfUF4W1k1qsyLo1f5nts1u0728d70e`, // Replace with the actual token dynamically
      'Content-Type': 'application/json',
    });

    // Return the HTTP request with the proper headers
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers });
  }
}
