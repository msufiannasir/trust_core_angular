import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionsService } from '../../../services/collections.service';
import { LocalDataSource } from 'ng2-smart-table';
import { MENU_ITEMS } from '../../../pages/pages-menu';
import { DatepickerComponent } from '../../../pages/forms/datepicker/datepicker.component'
import { NbCardModule } from '@nebular/theme';
import { FileUploadEditorComponent } from '../../fileupload/file-upload-editor.component';
import { UsersService } from '../../../services/users.service';


@Component({
  selector: 'ngx-smart-table',
  templateUrl: './collection-table.component.html',
  styleUrls: ['./collection-table.component.scss'],
})
export class CollectionTableComponent implements OnInit {
  collectionHandle: string | null = null;
  roles:any;
  userslist:any;
  currentPath: string;
  user_paths={offers:'', contracts:'', templates:''};
  singleuserdata=[];
  metaArray: { key: string; value: any }[] = [];
  formData: { key: string; value: any }[] = []; // New array to hold form data
  source: LocalDataSource = new LocalDataSource();
  settings = {
    actions: {
      add: true,
      edit: true,
      delete: true, // Keep delete off if not needed
    },
    add: {
      addButtonContent: '<i class="nb-plus "></i>',
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
    mode: 'inline', // Default mode (will update in ngOnInit)
  };
  handle: string | null = null; // Store handle globally
  allowedHandles = ['offers', 'contracts', 'templates']; // Define allowed handles
   // Dynamically set mode based on route
  showBlueprintButton: boolean = true;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private collectionsService: CollectionsService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    // Check if 'handle' exists in the current route
    this.route.paramMap.subscribe((params) => {
      const handle = params.get('handle');
      this.currentPath = this.router.url.split('?')[0]; // Remove query params
      // Define valid paths
      this.user_paths = {
        offers: '/pages/offers',
        contracts: '/pages/contracts',
        templates: '/pages/templates'
      };
      console.log("Current Path:", this.currentPath);
      // Ensure only requests with a valid 'handle' are processed
      if (handle) {
        if(handle == 'collections'){
          this.fetchAllCollection(handle);
          this.setTableTitle(handle);
          this.checkRouteForBlueprintButton();
        }else{
        this.fetchCollectionData(handle);
        this.setTableTitle(handle);
        this.checkRouteForBlueprintButton();
        }
      } else {
        console.warn('No handle provided in the route. Skipping data fetch.');
      }
      // Dynamically update mode based on handle
      if (this.allowedHandles.includes(handle)) {
        this.settings.mode = 'external';
        
      } else {
        this.settings.mode = 'inline';
      }
      // Force table refresh
      this.settings = { ...this.settings, mode: this.settings.mode };
    });
    this.usersService.listRoles('roles').subscribe(
      (response) => {
       this.roles=response;
       console.log(this.roles, 'this.roles');
      },
      (error) => {
        console.error('Error fetching collection data:', error);
      }
    );
    this.usersService.listUsers('user/all').subscribe(
      (response) => {
       this.userslist=response;
      },
      (error) => {
        console.error('Error fetching collection data:', error);
      }
    );
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
              type: 'html', // This allows rendering HTML
              valuePrepareFunction: (cell, row) => {
                return `<a href="${row.link}" target="">${cell}</a>`; 
              }
            },
          },
        };
      } else {
        console.warn('Invalid response format:', response);
      }
    }, (error) => {
      console.error('Error fetching collections:', error);
    });
  }
  

  fetchCollectionData(handle: string): void {
    const endpoint = `collections/show/${handle}`;
    this.collectionsService.getDynamicData(endpoint).subscribe(
      (response) => {
        if (response && response.columns && Array.isArray(response.columns)) {
          this.configureTableColumns(response.columns , response.data); // Dynamically configure columns
        }
        if (response && response.data && Array.isArray(response.data)) {
          this.source.load(response.data); // Populate table rows
        }
        // Use includes() to check path instead of direct comparison
        if (this.currentPath.includes(this.user_paths.offers)) {
          console.log("Current path matches offers section.");
          this.metaArray = Object.entries(response.data[0]).map(([key, value]) => ({
            key,
            value,
          }));
          this.metaArray = this.metaArray.filter(field => field.key);
          this.metaArray = this.metaArray.map(field => ({
            ...field,
            displayKey: field.key.replace('meta_', ''),
          }));
        }
      },
      (error) => {
        console.error('Error fetching collection data:', error);
      }
    );
  }

  setTableTitle(handle: string): void {
    console.log('Handle:', handle); // Log the handle
    const menuItem = MENU_ITEMS.find(item => item.link.includes(handle));
    if (menuItem) {
      this.settings.tableTitle = menuItem.title;
    }
  }

  configureTableColumns(columns: string[], data: any[]): void {
    let filter: any=true;
    const dynamicColumns: any = {};
    columns.forEach((column) => {
      // Define columns to exclude or hide
      const hiddenColumns = ['id', 'collection_id', 'created_at', 'updated_at']; 
      if (!hiddenColumns.includes(column)) {
        let formattedTitle: string;
        let fieldType: string = 'string'; // Default field type
        let editor: any = null; // Default editor is null
        let valuePrepareFunction: (cell: any, row: any) => string | null = null; // For displaying the value in the table row
  
        if (column.startsWith('rel_')) {
          filter= {
            type: 'list', // Specify filter type as 'list' for dropdown
            config: {
              selectText: 'Select option', // Placeholder text
              list: []
            },
          };
          // Relational dropdown field
          fieldType = 'dropdown';
          // Format title by removing the "rel_" prefix and cleaning up
          const withoutRel = column
            .replace(/^rel_/, '')
            .replace(/_col.*$/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
          formattedTitle = withoutRel;
        // Handling options array
        const options: { value: string; title: string }[] = [];
        data.forEach((row) => {
          if (row[column] && typeof row[column] === 'object') {
            const { allOptions } = row[column];
            if (Array.isArray(allOptions)) {
              allOptions.forEach((option) => {
                options.push({
                  value: option.id,
                  title: option.display,
                });
              });
            }
          }
        });
        // Remove duplicates from options
        const uniqueOptions = Array.from(
          new Map(options.map((option) => [option.value, option])).values()
        );
        filter.config.list=uniqueOptions;
        // Default "Please select an option" as the first dropdown item
        editor = {
          type: 'list',
          config: {
            list: [
              { value: '', title: 'Please select an option' }, // Default option
              ...uniqueOptions, // Add dynamic options
            ],
          },
        };
        valuePrepareFunction = (cell: any, row: any) => {
          // Check if the cell has a value and return it
          console.log(row[column].selected.id, 'row.column');
          const selectedOption = uniqueOptions.find(option => option.value == cell.selected.id);
          if (cell) {
            if(typeof selectedOption !='undefined'){
              return selectedOption.title;
            }
            return 'N/A';
          }else{
              console.log(selectedOption, 'else cell.selectedOption.id');
              // if(typeof selectedOption !='undefined'){
                  return row[column].selected.id;
                // }
              }
          };       
        }
        else if (column.startsWith('text_')) {
          // Text field
          fieldType = 'text';
          editor = { type: 'input' };
          formattedTitle = column
            .replace(/^text_/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        } else if (column.startsWith('textarea_')) {
          // Textarea field
          fieldType = 'textarea';
          editor = { type: 'textarea' };
          formattedTitle = column
            .replace(/^textarea_/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        } else if (column.startsWith('file_')) {
          // File field
          fieldType = 'files';
            // File field
            fieldType = 'file';
            editor = {
              type: 'custom', // Use custom editor type
              component: FileUploadEditorComponent, // Specify editor component
            };
              formattedTitle = column
            .replace(/^file_/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        } else if (column.startsWith('date_')) {
          // Date field
          fieldType = 'date';
          editor = {
            type: 'custom', // Use custom editor type
            component: DatepickerComponent, // Use your existing DatepickerComponent here
          };
          formattedTitle = column
            .replace(/^date_/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        } else {
          // Default case for other columns
          formattedTitle = column
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        }
  
        // Assign column configuration
        dynamicColumns[column] = {
          title: formattedTitle,
          type: fieldType,
          editor: editor,
          filter: filter,
          valuePrepareFunction: valuePrepareFunction,
          };
      }
    });
  
    // Merge dynamic columns into existing table settings
    this.settings = {
      ...this.settings, // Keep other settings intact
      columns: dynamicColumns, // Replace or update columns
    };
  }
  onCreateConfirm(event): void {
    const handle = this.route.snapshot.paramMap.get('handle'); // Get the collection handle
    if (handle) {
      this.collectionsService.createEntry(handle, event.newData).subscribe(
        (response) => {
          event.confirm.resolve(response); // Notify the table of success
  
          // Show success alert
          window.alert('Entry created successfully!');
  
          // Refresh the table data
          this.fetchCollectionData(handle);
        },
        (error) => {
          console.error('Error creating entry:', error);
  
          // Show error alert
          window.alert('Failed to create entry. Please try again.');
  
          event.confirm.reject(); // Notify the table of failure
        }
      );
    } else {
      event.confirm.reject(); // No handle, reject the action
    }
  }
  
  onEditConfirm(event): void {
    const handle = this.route.snapshot.paramMap.get('handle'); // Get the collection handle
    const entryId = event.data.id; // Assuming the entry has an `id` field
    if (handle && entryId) {
      this.collectionsService.updateEntry(handle, entryId, event.newData).subscribe(
        (response) => {
          event.confirm.resolve(response); // Notify the table of success
  
          // Show success alert
          window.alert('Entry updated successfully!');
  
          // Refresh the table data
          this.fetchCollectionData(handle);
        },
        (error) => {
          console.error('Error updating entry:', error);
  
          // Show error alert
          window.alert('Failed to update entry. Please try again.');
  
          event.confirm.reject(); // Notify the table of failure
        }
      );
    } else {
      event.confirm.reject(); // No handle or entry ID, reject the action
    }
  }
  
  onDeleteConfirm(event): void {
    const handle = this.route.snapshot.paramMap.get('handle');
    const entryId = event.data.id;
    if (handle && entryId) {
      this.collectionsService.deleteEntry(handle, entryId).subscribe(
        (response) => {
          console.log('Entry deleted successfully:', response);
          event.confirm.resolve(); // Notify the table of success
  
          // Show success alert
          window.alert('Entry deleted successfully!');
  
          // Refresh the table data
          this.fetchCollectionData(handle);
        },
        (error) => {
          console.error('Error deleting entry:', error);
  
          // Show error alert
          window.alert('Failed to delete entry. Please try again.');
  
          event.confirm.reject(); // Notify the table of failure
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
        'pages/settings',  // Example route where Blueprint button should be hidden
        'pages/permissions',  // Another example route
        'pages/reports', 
        'pages/collections',  // Another route
      ];  
      // Check if the current URL contains any of the hidden routes
      this.showBlueprintButton = !hiddenRoutes.some(route => currentUrl.includes(route));
    }

     // Override Create button behavior
  onCreate(event: any) {
    this.handle = this.route.snapshot.paramMap.get('handle');
    if (this.handle && this.allowedHandles.includes(this.handle)) {
      this.router.navigate([`/pages/${this.handle}/create`]);
    }
  }

  // Override Edit button behavior
  onEdit(event: any) {
    this.handle = this.route.snapshot.paramMap.get('handle');
    if (this.handle && this.allowedHandles.includes(this.handle)) {
      const entryId = event.data.id;
      this.router.navigate([`/pages/${this.handle}/entry/${entryId}`]);
    }
  }
}
