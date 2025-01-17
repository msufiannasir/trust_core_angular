import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const authToken = this.getAuthToken();
    if (authToken) {
      return true; // Allow access if token exists
    } else {
      this.router.navigate(['/auth/login']); // Redirect to login if no token
      return false;
    }
  }
  private getAuthToken(): string | null {
    var auth_app_token=localStorage.getItem('auth_app_token');
    if(auth_app_token){
      return auth_app_token;
    }
  
    return null;
  }
}
