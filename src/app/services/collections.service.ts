import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Import the environment file

@Injectable({
  providedIn: 'root',
})
export class CollectionsService {
  private apiUrl = environment.baseEndpoint; // Get the API URL from the environment file

  constructor(private http: HttpClient) {}

  // Method to get collection data by endpoint
  getDynamicData(endpoint: string): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers
    const fullUrl = `${this.apiUrl}${endpoint}`; // Full URL to the backend
    return this.http.get(fullUrl, { headers });
  }
  getCollections(): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers
    const fullUrl = `${this.apiUrl}collections/all`; // Full URL to the backend
    return this.http.get(fullUrl, { headers });
  }

  // Method to create an entry
  createEntry(handle: string, data: any): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers
    return this.http.post(`${this.apiUrl}/collections/${handle}/entry/create`, data, { headers });
  }

  // Method to update an entry
  updateEntry(handle: string, entryId: string, data: any): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers
    return this.http.put(`${this.apiUrl}/collections/${handle}/entry-update/${entryId}`, data, { headers });
  }

  // Method to delete an entry
  deleteEntry(handle: string, entryId: string): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers
    return this.http.delete(`${this.apiUrl}/collections/${handle}/entry-delete/${entryId}`, { headers });
  }

  // Create headers dynamically
  private createHeaders(): HttpHeaders {
    const authToken = localStorage.getItem('AuthToken'); // Get the token from local storage
    return new HttpHeaders({
      'Authorization': `Bearer ${authToken}`, // Replace with the actual token dynamically
      'Content-Type': 'application/json',
    });
  }
}
