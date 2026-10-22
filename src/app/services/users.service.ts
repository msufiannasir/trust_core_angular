import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { OrdersChart } from '../@core/data/orders-chart';


@Injectable({
  providedIn: 'root'
})
export class UsersService {
  apiUrl=environment.baseEndpoint;
  httpOptions:any;
  currentUser=JSON.parse(localStorage.getItem('user'));
  constructor(private http: HttpClient, private router: Router) {
    this.httpOptions = {
      headers: new HttpHeaders({
      //   'Content-Type':  'application/json',
        'Authorization': 'Basic ' + btoa('admin:s#;j!md4C!UUY5E(L*=2')
      })
    };
   }
  logout(){
    localStorage.setItem('auth_app_token', '');
    localStorage.setItem('user', '');
    window.location.href=environment.baseurl+'/auth/login';
    //this.router.navigate(['/auth/login']);
  }
  listUsers(endpointWithHandle): Observable<any> {
    const headers = this.createHeaders();
    var currentUser=JSON.parse(localStorage.getItem('user'));
    console.log(currentUser, 'currentUser');
    // Combine base API URL with the endpoint (handle dynamic API calls)
    const fullUrl = `${this.apiUrl}`+endpointWithHandle+"?current_user_id="+currentUser.id+'&current_role='+currentUser.roles[0].name; // Full URL to the backend
    console.log(fullUrl, 'fullUrl');
    return this.http.get(fullUrl, { headers });
  }
  listAdminUsers(endpointWithHandle): Observable<any> {
    const headers = this.createHeaders();
    var currentUser=JSON.parse(localStorage.getItem('user'));
    // Combine base API URL with the endpoint (handle dynamic API calls)
    const fullUrl = `${this.apiUrl}`+endpointWithHandle+"?current_user_id="+currentUser.id+'&current_role=admin'; // Full URL to the backend
    return this.http.get(fullUrl, { headers });
  }
  getUser(endpointWithHandle): Observable<any> {
    const headers = this.createHeaders();

    // Combine base API URL with the endpoint (handle dynamic API calls)
    const fullUrl = `${this.apiUrl}`+endpointWithHandle; // Full URL to the backend
    console.log(fullUrl, 'fullUrl');
    return this.http.get(fullUrl, { headers });
  }
  listRoles(endpointWithHandle): Observable<any> {
    const headers = this.createHeaders();

    // Combine base API URL with the endpoint (handle dynamic API calls)
    const fullUrl = `${this.apiUrl}`+endpointWithHandle; // Full URL to the backend
    console.log(fullUrl, 'fullUrl');
    return this.http.get(fullUrl, { headers });
  }
  createEntry( data: any): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers
    return this.http.post(`${this.apiUrl}user/register`, data, { headers });
  }
  updateUserProfile( data: any, user_id:any=''): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers
    console.log(user_id, 'user_id');
    if(user_id=='' || user_id=='undefined' || user_id==null){
      user_id=this.currentUser.id;
    }
    console.log(user_id, 'user_id');
    return this.http.post(`${this.apiUrl}user/edit/`+user_id, data, { headers });
  }

  // Method to delete an entry
  deleteEntry(handle: string, entryId: string): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers
    return this.http.delete(`${this.apiUrl}user/delete/${entryId}`, { headers });
  }
    // Method to delete an entry
  pullReports(): Observable<any> {
    var currentUser=JSON.parse(localStorage.getItem('user'));
    const headers = this.createHeaders(); // Use the global method for headers
    return this.http.get(`${this.apiUrl}user/reports/all?current_user_id=${currentUser.id}&current_role=${currentUser.roles[0].name}`, { headers });
  }

  getOrdersChartData(period: string): Observable<OrdersChart> {
    const headers = this.createHeaders();
    var currentUser=JSON.parse(localStorage.getItem('user'));
    const reports = this.http.get<{ 
      Offers: Array<{ month: string; count: number }>;
      Customers: Array<{ month: string; count: number }>;
    }>(`${this.apiUrl}user/reports/all?current_user_id=${currentUser.id}&current_role=${currentUser.roles[0].name}`, { headers });

    // Get last 12 months for chart labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartLabels = this.getLast12Months().map(label => {
      const [month, year] = label.split('/');
      return monthNames[parseInt(month) - 1];
    });
    
    return new Observable<OrdersChart>(observer => {
      reports.subscribe(response => {
        // Initialize arrays with zeros for all months
        const offersData = new Array(12).fill(0);
        const customersData = new Array(12).fill(0);
        
        if (response) {
          // Map offers to corresponding months
          if (response.Offers) {
            response.Offers.forEach(offer => {
              const [year, month] = offer.month.split('-');
              const formattedMonth = `${month}/${year}`;
              const monthIndex = this.getLast12Months().indexOf(formattedMonth);
              if (monthIndex !== -1) {
                offersData[monthIndex] = offer.count;
              }
            });
          }

          // Map customers to corresponding months
          if (response.Customers) {
            response.Customers.forEach(customer => {
              const [year, month] = customer.month.split('-');
              const formattedMonth = `${month}/${year}`;
              const monthIndex = this.getLast12Months().indexOf(formattedMonth);
              if (monthIndex !== -1) {
                customersData[monthIndex] = customer.count;
              }
            });
          }
        }

        const chartData: OrdersChart = {
          chartLabel: chartLabels,
          linesData: [
            offersData,
            customersData,
          ],
        };

        observer.next(chartData);
        observer.complete();
      });
    });
  }
  getUserSettings(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${this.apiUrl}user/detail`, { headers });
  }
  
  // Method to get last 12 months in mm/yyyy format
  getLast12Months(): string[] {
    const months: string[] = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      months.push(`${month}/${year}`);
    }
    
    return months.reverse(); // Return in chronological order
  }

  // Method to get chart data with last 12 months as labels
  getChartData(): Observable<any> {
    const chartLabels = this.getLast12Months();
    // ... rest of your chart data logic
    return new Observable(observer => {
      observer.next({
        chartLabel: chartLabels,
        // ... other chart data properties
      });
      observer.complete();
    });
  }

  private createHeaders(): HttpHeaders {
    const authToken = localStorage.getItem('AuthToken'); // Get the token from local storage
    return new HttpHeaders({
      'Authorization': `Bearer ${authToken}`, // Replace with the actual token dynamically
      'Content-Type': 'application/json',
    });
  }

  getUserFields() {
    return this.http.get(`${this.apiUrl}users/fields`);
  }

  createUser(userData: any) {
    return this.http.post(`${this.apiUrl}users`, userData);
  }
  getCurrentLanguage(): string {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.meta && parsedUser.meta.settings) {
        const settings = JSON.parse(parsedUser.meta.settings);
        return settings.language_setting || 'en';
      }
    }
    return 'en';
  }
  getTranslations(key: string): string {
    const translations = require('../translations/translations.json');
    var currentLanguage=this.getCurrentLanguage();
    if(currentLanguage=='en'){
      return key;
    }else{
      return translations[key] ? translations[key][currentLanguage] : key;
    }
  }
}
