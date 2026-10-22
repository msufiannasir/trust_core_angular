import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute  } from '@angular/router';
import { CollectionsService } from '../app/services/collections.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router, 
    private collectionsService: CollectionsService,
    ) {}
  currentRoute;
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = localStorage.getItem('user');
    const parsedUser = JSON.parse(user);
    var handle=route.paramMap.get('handle');
    var handledata=route.data['permission'];
    // var accessControl=this.accessControl();
    if(typeof handle =='undefined' || handle==null || handle==''){
      handle=handledata;
    }
    var userrole;
    if (parsedUser && parsedUser.roles) {
       userrole=parsedUser.roles[0].id;
       this.currentRoute =route;
    }
    console.log(userrole, 'Current Route:', handle, handledata);
  
    const authToken = this.getAuthToken();
    if (authToken) {
      // console.log(accessControl[userrole].view, 'accessControl[userrole].view', accessControl[userrole].view[0].includes(handle));
      // if(accessControl[userrole].view[0].includes(handle)){
      //   return true; // Allow access if token exists
      // }else{
      //   this.router.navigate(['/dashboard']); // Redirect to login if no token
      // }

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
  // accessControl(){
  //   var accessControllist={
  //     3: {view: ['offers, reports, settings, dashboard'], edit:[]},
  //     2: {view: ['users, offers, templates, dashboard'], edit:['users, offers, templates, reports, settings, collections']},
  //     1: {view: ['users, offers, templates, reports, settings, collections, dashboard, createuser, updateuser'], edit:['users, offers, templates, reports, settings, collections,createuser, updateuser']}
  //   };
  //   return accessControllist;
  // }


  fetchAllCollection(handle: string): void {
    this.collectionsService.getCollections().subscribe((response) => {
      if (response && response.collection && Array.isArray(response.collection)) {
        const formattedData = response.collection.map((item: any) => ({
          name: item.name,
          link: `/pages/${item.handle}`, // Generating the correct link
          handle: item.handle, // Storing handle separately for link creation
        }));
      } else {
        console.warn('Invalid response format:', response);
      }
    }, (error) => {
      console.error('Error fetching collections:', error);
    });
  }
  


}
