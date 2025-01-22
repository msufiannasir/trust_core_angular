import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { LocalDataSource } from 'ng2-smart-table';
import { MENU_ITEMS } from '../../pages/pages-menu'; 

@Component({
  selector: 'ngx-smart-table',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  source: LocalDataSource = new LocalDataSource();
  currentEndpoint: string;

  collectionHandle: string | null = null;
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const handle = params.get('handle');
      const currentPath = this.router.url;

      // if (handle) {
        this.currentEndpoint = this.determineEndpoint(currentPath);
        this.fetchUserData();
      // }
    });
  }

  determineEndpoint(path: string): string {
    const endpointMapping: { [key: string]: string } = {
      '/dashboard': '/api/dashboard',
      '/users': '/user/all',
    };

    for (const route in endpointMapping) {
      if (path.includes(route)) {
        return endpointMapping[route];  // Return the endpoint without 'handle'
      }
    }

    return '/api/collection';
  }

  fetchUserData(): void {
    const endpointWithHandle = `${this.currentEndpoint}`;
    console.log(endpointWithHandle, 'endpointWithHandle');
    this.usersService.listUsers(endpointWithHandle).subscribe(
      (response) => {
        if (response && response.columns && Array.isArray(response.columns)) {
          this.configureTableColumns(response.columns); // Dynamically configure columns
        }
        if (response && response.data && Array.isArray(response.data)) {
          this.source.load(response.data); // Populate table rows
        }
      },
      (error) => {
        console.error('Error fetching collection data:', error);
      }
    );
  }

  configureTableColumns(columns: string[]): void {
    const dynamicColumns: any = {};
    
    // // Define a custom column for ID (this will be the sequential number column)
    // dynamicColumns['ID'] = {
    //   title: 'ID',
    //   type: 'string',
    //   valuePrepareFunction: (cell, row, rowIndex) => {
    //     // Return the rowIndex + 1 as the sequential number
    //     return (rowIndex + 1).toString(); // Ensure this returns a string
    //   },
    // };
    
    columns.forEach((column) => {
      // Define the columns you want to exclude or hide
      const hiddenColumns = ['id', 'collection_id', 'roles_created_at', 'roles_updated_at','roles_name', 'settings', 'meta_last_login', 'meta_id', 'meta_user_id','meta_settings','email_verified_at','meta_created_at','meta_updated_at', 'created_at','updated_at']; // Hide "id" column
    
      if (!hiddenColumns.includes(column)) {
        // Convert column name to human-readable format
        const formattedTitle = column
          .replace(/_/g, ' ') .replace(/meta/g, ' ') .replace(/roles/g, 'role') // Replace underscores with spaces
          .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
    
        dynamicColumns[column] = {
          title: formattedTitle, // Use formatted title
          type: 'string', // Default type; customize if necessary
        };
      }
    });
    dynamicColumns['password']={title:'Password', type: 'string'};
    // Merge dynamic columns into the existing settings while preserving actions
    this.settings = {
      ...this.settings, // Keep existing settings (including actions)
      columns: dynamicColumns, // Update only columns
    };
  }

  onDeleteConfirm(event): void {
    const handle = this.route.snapshot.paramMap.get('handle');
    const entryId = event.data.id;
    if (entryId) {
      if(confirm("Are you sure to delete user "+event.data.name)) {
        this.usersService.deleteEntry(handle, entryId).subscribe(
          (response) => {
            console.log('User deleted successfully:', response);
            event.confirm.resolve(); // Notify the table of success
    
            // Show success alert
            window.alert('User deleted successfully!');
    
            // Refresh the table data
            this.fetchUserData();
          },
          (error) => {
            console.error('Error deleting entry:', error);
    
            // Show error alert
            window.alert('Failed to delete entry. Please try again.');
    
            event.confirm.reject(); // Notify the table of failure
          }
        );
      }
    } else {
      event.confirm.reject();
    }
  }
  onCreateUpdateConfirm(event): void {
    const handle = this.route.snapshot.paramMap.get('handle'); // Get the collection handle
    // if (handle) {
      this.usersService.createEntry(event.newData).subscribe(
        (response) => {
          event.confirm.resolve(response); // Notify the table of success
  
          // Show success alert
          window.alert(response.message);
  
          // Refresh the table data
          this.fetchUserData();
        },
        (error) => {
          console.log('Error creating entry:', error);
  
          // Show error alert
          var errorslist='';
          var current_errors=error.error.errors;
          for (const key in current_errors) {
            if (current_errors.hasOwnProperty(key)) {
                // Loop through the child array (the error messages)
                current_errors[key].forEach(message => {
                  errorslist+=`${key}: ${message}`;
                    console.log(`${key}: ${message}`);
                });
            }
        }
          window.alert('Failed to create entry.'+ errorslist);
  
          event.confirm.reject(); // Notify the table of failure
        }
      );
    // } else {
    //   event.confirm.reject(); // No handle, reject the action
    // }
  }
}
