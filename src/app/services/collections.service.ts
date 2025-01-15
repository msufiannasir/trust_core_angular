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

  // Method to create an entry
  createEntry(handle: string, data: any): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers
    return this.http.post(`${this.apiUrl}/collections/${handle}/entry/create`, data, { headers });
  }

  // Method to update an entry
  updateEntry(handle: string, entryId: string, data: any): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers
    return this.http.put(`${this.apiUrl}/collections/${handle}/entry/${entryId}/update`, data, { headers });
  }

  // Method to delete an entry
  deleteEntry(handle: string, entryId: string): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers
    return this.http.delete(`${this.apiUrl}/collections/${handle}/entry/${entryId}/delete`, { headers });
  }

  // Create headers dynamically
  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer 13|s9rFMB3eFl6wyxfVH3wfUF4W1k1qsyLo1f5nts1u0728d70e`, // Replace with the actual token dynamically
      'Content-Type': 'application/json',
    });
  }
}
