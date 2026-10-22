import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Import the environment file
import { OrdersChart } from '../@core/data/orders-chart';

@Injectable({
  providedIn: 'root',
})
export class CollectionsService {
  private apiUrl = environment.baseEndpoint; // Get the API URL from the environment file

  constructor(private http: HttpClient) {}

  // Method to get collection data by endpoint
  getCLineChartData(){
    
  }
  getDynamicData(endpoint: string): Observable<any> {
    var currentUser=JSON.parse(localStorage.getItem('user'));

    const headers = this.createHeaders(); // Use the global method for headers
    const fullUrl = `${this.apiUrl}${endpoint}`+"?current_user_id="+currentUser.id+'&current_role='+currentUser.roles[0].name; // Full URL to the backend
    return this.http.get(fullUrl, { headers });
  }
  getCollections(): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers
    var currentUser=JSON.parse(localStorage.getItem('user'));
    const fullUrl = `${this.apiUrl}collections/all`+"?current_user_id="+currentUser.id+'&current_role='+currentUser.roles[0].name; // Full URL to the backend
    return this.http.get(fullUrl, { headers });
  }

  // Method to create an entry
  createEntry(handle: string, data: any): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers
    var currentUser=JSON.parse(localStorage.getItem('user'));
    return this.http.post(`${this.apiUrl}collections/${handle}/entry/create?current_user_id=${currentUser.id}&current_role=${currentUser.roles[0].name}`, data, { headers });
  }

  // Method to update an entry
  updateEntry(handle: string, entryId: string, data: any): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers
    var currentUser=JSON.parse(localStorage.getItem('user'));
    return this.http.put(`${this.apiUrl}collections/${handle}/entry-update/${entryId}?current_user_id=${currentUser.id}&current_role=${currentUser.roles[0].name}`, data, { headers });
  }

  // Method to delete an entry
  deleteEntry(handle: string, entryId: string): Observable<any> {
    var currentUser=JSON.parse(localStorage.getItem('user'));

    const headers = this.createHeaders(); // Use the global method for headers
    return this.http.delete(`${this.apiUrl}collections/${handle}/entry-delete/${entryId}?current_user_id=${currentUser.id}&current_role=${currentUser.roles[0].name}`, { headers });
  }


   // Fetch entry details by handle
   getEntryDetail(handle: string, entryId: string): Observable<any> {
    var currentUser=JSON.parse(localStorage.getItem('user'));

    return this.http.get(`${this.apiUrl}collections/${handle}/entry-detail/${entryId}?current_user_id=${currentUser.id}&current_role=${currentUser.roles[0].name}`, { headers: this.createHeaders() });
  }
  
  // Get fields from meta collection table
  getCollectionsFields(handle: string): Observable<any> {
    const headers = this.createHeaders();
    var currentUser=JSON.parse(localStorage.getItem('user'));
    return this.http.get(`${this.apiUrl}collections/${handle}/get-fields`+"?current_user_id="+currentUser.id+'&current_role='+currentUser.roles[0].name, { headers });
  }

  // Create a new collection
  createCollection(data: { name: string }): Observable<any> {
    const headers = this.createHeaders();
    return this.http.post(`${this.apiUrl}collections/create`, data , { headers });
  }

  // Update an existing collection
  updateCollection(data: { name: string }, collectionHandle: string): Observable<any> {
    const headers = this.createHeaders();
    return this.http.put(`${this.apiUrl}collections/edit/${collectionHandle}`, data , { headers });
  }

  // Delete a collection
  deleteCollection(collectionHandle: string): Observable<any> {
    const headers = this.createHeaders();
    return this.http.delete(`${this.apiUrl}collections/delete/${collectionHandle}` , { headers });
  }

  // Static data method for orders chart


  // Create headers dynamically
  private createHeaders(): HttpHeaders {
    const authToken = localStorage.getItem('AuthToken'); // Get the token from local storage
    return new HttpHeaders({
      'Authorization': `Bearer ${authToken}`, // Replace with the actual token dynamically
      'Content-Type': 'application/json',
    });
  }
}
