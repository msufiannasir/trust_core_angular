import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { LocalDataSource } from 'ng2-smart-table';
import { MENU_ITEMS } from '../../pages/pages-menu'; 

@Component({
  selector: 'ngx-smart-table',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  source: LocalDataSource = new LocalDataSource();
  currentEndpoint: string;

  collectionHandle: string | null = null;
  settings = {
    // add: {
    //   addButtonContent: '<i class="nb-plus"></i>',
    //   createButtonContent: '<i class="nb-checkmark"></i>',
    //   confirmCreate: false,
    //   cancelButtonContent: '<i class="nb-close"></i>',
    // },
    // edit: {
    //   editButtonContent: '<i class="nb-edit"></i>',
    //   saveButtonContent: '<i class="nb-checkmark"></i>',
    //   cancelButtonContent: '<i class="nb-close"></i>',
    //   confirmSave: false, 
    // },
    // delete: {
    //   deleteButtonContent: '<i class="nb-trash"></i>',
    //   confirmDelete: false,
    // },
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
        this.fetchData();
      // }
    });
  }

  determineEndpoint(path: string): string {
    const endpointMapping: { [key: string]: string } = {
      '/dashboard': '/api/dashboard',
      '/roles/all': '/roles',
    };

    for (const route in endpointMapping) {
      if (path.includes(route)) {
        return endpointMapping[route];  // Return the endpoint without 'handle'
      }
    }

    return '/api/collection';
  }

  fetchData(): void {
    const endpointWithHandle = `${this.currentEndpoint}`;
    console.log(endpointWithHandle, 'endpointWithHandle');
    this.usersService.listRoles(endpointWithHandle).subscribe(
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
      const hiddenColumns = [ 'created_at','updated_at']; // Hide "id" column
    
      if (!hiddenColumns.includes(column)) {
        // Convert column name to human-readable format
        const formattedTitle = column
          .replace(/_/g, ' ') // Replace underscores with spaces
          .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
    
        dynamicColumns[column] = {
          title: formattedTitle, // Use formatted title
          type: 'string', // Default type; customize if necessary
        };
      }
    });
    // Merge dynamic columns into the existing settings while preserving actions
    this.settings = {
      ...this.settings, // Keep existing settings (including actions)
      columns: dynamicColumns, // Update only columns
    };
  }


}
