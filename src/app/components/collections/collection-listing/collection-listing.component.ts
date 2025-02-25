import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionsService } from '../../../services/collections.service';
import { LocalDataSource } from 'ng2-smart-table';
import { MENU_ITEMS } from '../../../pages/pages-menu';
import { DatepickerComponent } from '../../../pages/forms/datepicker/datepicker.component'
import { NbCardModule } from '@nebular/theme';
import { FileUploadEditorComponent } from '../../fileupload/file-upload-editor.component';
import { UsersService } from '../../../services/users.service';
import { CustomLinkRenderComponent } from './custom-link-render.component';



@Component({
  selector: 'ngx-smart-table',
  templateUrl: './collection-listing.component.html',
  styleUrls: ['./collection-listing.component.scss'],
})
export class CollectionListingComponent implements OnInit {
  collectionHandle: string | null = null;
  roles:any;
  userslist:any;
  currentPath: string;
  user_paths={offers:'', contracts:''};
  singleuserdata=[];
  metaArray: { key: string; value: any }[] = [];
  formData: { key: string; value: any }[] = []; // New array to hold form data
  source: LocalDataSource = new LocalDataSource();
  settings = {
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
      createButtonContent: '<i class="nb-checkmark"></i>',
      confirmCreate: true,
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    edit: {
      editButtonContent: '<i class="nb-edit"></i>',
      saveButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
      confirmSave: true, 
    },
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
      confirmDelete: true,
    },
    tableTitle: '', 
    columns: {}, // Initially empty, populated dynamically
    pager: {
      perPage: 10, // Default items per page
    },
  };
  handle: string | null = null; // Store handle globally
  allowedHandles = ['offers', 'contracts', 'settings']; // Define allowed handles

  showBlueprintButton: boolean = true;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private collectionsService: CollectionsService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    // Check if 'handle' exists in the current route
    this.route.url.subscribe((segments) => {
      // const handle = params.get('handle');
    // Extract the first segment (collections) and the second segment (all)
    const handle = segments.length > 0 ? segments[0].path : null;
      // Define valid paths
      this.user_paths = {
        offers: '/pages/offers',
        contracts: '/pages/contracts'
      };
      console.log("Current Path:", this.currentPath);
      console.log("Current Path:", this.handle);
      // Ensure only requests with a valid 'handle' are processed
      if (handle) {
        if(handle == 'collections'){
          this.fetchAllCollection(handle);
          this.setTableTitle(handle);
          this.checkRouteForBlueprintButton();
        }
      } else {
        console.warn('No handle provided in the route. Skipping data fetch.');
      }
    });

  }

  fetchAllCollection(handle: string): void {
    this.collectionsService.getCollections().subscribe((response) => {
      if (response && response.collection && Array.isArray(response.collection)) {
        const formattedData = response.collection.map((item: any) => ({
          name: item.name,
          link: `/pages/${item.handle}`, // Generating the correct link
          handle: item.handle, // Storing handle separately for link creation
        }));
        this.source.load(formattedData); // Load formatted data into the table
        // Update table settings dynamically
        this.settings = {
          ...this.settings,
          columns: {
            name: {
              title: 'Collection Name',
              // type: 'html', // This allows rendering HTML
              type: 'custom',
              renderComponent: CustomLinkRenderComponent,
            },
            // collectionHandle: {
            //   title: 'Collection Handle',
            //   type: 'text',
            // },
          },
        };
      } else {
        console.warn('Invalid response format:', response);
      }
    }, (error) => {
      console.error('Error fetching collections:', error);
    });
  }
  
  openlink(url){
    this.router.navigateByUrl(url);
  }
  setTableTitle(handle: string): void {
    console.log('Handle:', handle); // Log the handle
    const menuItem = MENU_ITEMS.find(item => item.link.includes(handle));
    if (menuItem) {
      this.settings.tableTitle = menuItem.title;
    }
  }

  
// Create Collection
onCreateConfirm(event): void {
  this.collectionsService.createCollection({ name: event.newData.name }).subscribe(
    (response) => {
      event.confirm.resolve(response);
      window.alert(response.message); // Show API response message
      this.fetchAllCollection(this.handle); // Refresh table after creation
    },
    (error) => {
      console.error('Error:', error);
      window.alert(error.error.message || 'Failed to create collection.'); // Show API error message
      event.confirm.reject();
    }
  );
}

// Update Collection
onEditConfirm(event): void {
  const collectionHandle = event.newData.handle;
  this.collectionsService.updateCollection({ name: event.newData.name }, collectionHandle).subscribe(
    (response) => {
      event.confirm.resolve(response);
      window.alert(response.message); // Show API response message
      this.fetchAllCollection(this.handle); // Refresh data after update
    },
    (error) => {
      console.error('Error:', error);
      window.alert(error.error.message || 'Failed to update collection.'); // Show API error message
      event.confirm.reject();
    }
  );
}

// Delete Collection
onDeleteConfirm(event): void {
  const collectionHandle = event.data.handle;
  if (confirm('Are you sure you want to delete this collection?')) {
    this.collectionsService.deleteCollection(collectionHandle).subscribe(
      (response) => {
        event.confirm.resolve();
        window.alert(response.message); // Show API response message
        this.fetchAllCollection(this.handle); // Refresh data after deletion
      },
      (error) => {
        console.error('Error:', error);
        window.alert(error.error.message || 'Failed to delete collection.'); // Show API error message
        event.confirm.reject();
      }
    );
  } else {
    event.confirm.reject();
  }
}


  
  navigateToBlueprint(): void {
    const currentUrl = this.route.snapshot.url.map(segment => segment.path).join('/');
    console.log("currentUrl: " + currentUrl);
  
    const blueprintUrl = `/pages/${currentUrl}/blueprint`; // Construct the correct URL explicitly
    console.log("blueprintUrl: " + blueprintUrl);
  
    // Navigate to the constructed absolute path
    this.router.navigateByUrl(blueprintUrl).catch((error) => {
      console.error('Navigation error:', error);
    });
  }
  
  isHidden(key: string): boolean {
    const hiddenFields = ['id', 'user_id', 'created_at', 'collection_id', 'updated_at', 'last_login', 'employee_assigned','settings'];
    return hiddenFields.includes(key);
  }
    // Check the route and decide if the blueprint button should be shown
    checkRouteForBlueprintButton(): void {
      const currentUrl = this.router.url; 
      // Define an array of routes where the button should be hidden
      const hiddenRoutes = [
        'pages/settings',  // Example route where button should be hidden
        'pages/permissions',  // Another example route
        'pages/reports', 
        'pages/collections',  // Another route
      ];  
      // Check if the current URL contains any of the hidden routes
      this.showBlueprintButton = !hiddenRoutes.some(route => currentUrl.includes(route));
    }

}
