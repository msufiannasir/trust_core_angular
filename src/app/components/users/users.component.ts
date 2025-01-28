import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { CollectionsService } from '../../services/collections.service';
import { LocalDataSource } from 'ng2-smart-table';
import { MENU_ITEMS } from '../../pages/pages-menu'; 
import { ReplacePipe } from '../../replace.pipe'; 
import { DatepickerComponent } from '../datepicker/datepicker.component'
import { FileUploadEditorComponent } from '../fileupload/file-upload-editor.component';

@Component({
  selector: 'ngx-smart-table',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  source: LocalDataSource = new LocalDataSource();
  currentEndpoint: string;
  currentPath: string;
  user_paths={profile:'', listings:''};
  singleuserdata=[];
  metaArray: { key: string; value: any }[] = [];
  formData: { key: string; value: any }[] = []; // New array to hold form data
  password='';
  roles:any;
  collectionlist:any;
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
    private usersService: UsersService,
    private collectionsService: CollectionsService
  ) {}

  ngOnInit(): void {
    // a JS workaround to dynamicaly make inpit type date 
    const intervalId = setInterval(() => {
        // Select all elements with IDs starting with 'meta_date'
        const dateElements = document.querySelectorAll('[ng-reflect-name^="meta_date"]');
        // Iterate over the selected elements
        dateElements.forEach((element) => {
            // Cast the element to HTMLInputElement
            const inputElement = element as HTMLInputElement;
            console.log(inputElement, 'inputElement');
            // Change the input type to date if it's currently text
            if (inputElement.type === 'text') {
                inputElement.type = 'date'; // Change the input type to date
            }
        });
    }, 2000);
    this.user_paths.profile='/pages/user/profile';
    this.user_paths.listings='/pages/users/list';
    this.route.paramMap.subscribe((params) => {
      const handle = params.get('handle');
      const currentPath = this.currentPath=this.router.url;
      console.log(currentPath);
      this.usersService.listRoles('roles').subscribe(
        (response) => {
         this.roles=response;
         console.log(this.roles, 'this.roles');
        },
        (error) => {
          console.error('Error fetching collection data:', error);
        }
      );
      this.collectionsService.getCollections().subscribe(
        (response) => {
         this.collectionlist=response;
         console.log(this.collectionlist, 'this.collections');
        },
        (error) => {
          console.error('Error fetching collection data:', error);
        }
      );
      this.currentEndpoint = this.determineEndpoint(currentPath);
      this.fetchUserData();
    });
    
    
  }

  // ... existing code ...

  captureFieldValue(value: string, index): void {
    console.log(value, 'captureFieldValue');
    // Update formData array based on input field changes
    if(index=='password'){
      this.password=value;
    }else{
      if (!this.formData[index]) {
        this.formData[index] = { ...this.metaArray[index] }; // Initialize if not already present
      }
      this.formData[index].value = value;
      console.log(this.formData, 'Current Form Data');
    }

  }
  isHidden(key: string): boolean {
    const hiddenFields = ['id', 'user_id', 'created_at', 'updated_at', 'last_login', 'employee_assigned','settings'];
    return hiddenFields.includes(key);
  }
  determineEndpoint(path: string): string {
    const endpointMapping: { [key: string]: string } = {
      '/dashboard': 'api/dashboard',
      '/pages/users/list': 'user/all',
      '/pages/user/profile': 'user/detail/'+this.usersService.currentUser.id,
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
        if(this.currentPath==this.user_paths.listings){
          // console.log(response.columns,Array.isArray(response.columns),'Array.isArray(response.columns)');
          if (response && response.columns) {
            this.configureTableColumns(response.columns, response.data); // Dynamically configure columns
          }
          if (response && response.data && Array.isArray(response.data)) {
            this.source.load(response.data); // Populate table rows
          }
        }
        if(this.currentPath==this.user_paths.profile){
          // this.singleuserdata=response.data[0];
          this.metaArray = Object.entries(response.data[0]).map(([key, value]) => ({
            key,
            value,
          }));
          const excludedFields = ['name','created_at', 'updated_at', 'roles_id', 'roles_name','last_login', 'remember_token', 'email_verified_at', 'settings','meta_id', 'meta_created_at', 'meta_updated_at', 'meta_last_login', 'meta_settings', 'meta_user_id', 'email_verified_at','id','meta_employee_assigned'];
          // Filter the metaArray to exclude certain fields
          this.metaArray = this.metaArray.filter(
            (field) => !excludedFields.includes(field.key)
          );
          this.metaArray = this.metaArray.map((field) => ({
            ...field,
            displayKey: field.key.replace('meta_', ''), // Replace "meta_" with an empty string
          }));
        }

      },
      (error) => {
        console.error('Error fetching collection data:', error);
      }
    );
  }

  configureTableColumns(columns: { [key: string]: string },data: any[]): void {
    const dynamicColumns: any = {};
  
    // Define the columns you want to exclude or hide
    const hiddenColumns = [
      'name',
      'id',
      'collection_id',
      'roles_created_at',
      'roles_updated_at',
      'roles_name',
      'settings',
      'meta_last_login',
      'meta_id',
      'meta_user_id',
      'meta_settings',
      'email_verified_at',
      'meta_created_at',
      'meta_updated_at',
      'created_at',
      'updated_at',
    ];
    // Iterate over the keys of the columns object
    Object.keys(columns).forEach((columnKey) => {
      if (!hiddenColumns.includes(columnKey)) {
        let formattedTitle: string;
        let fieldType: string = 'string'; // Default field type
        let editor: any = null; // Default editor is null
        let filter: any=true;
        let valuePrepareFunction: (cell: any, row: any) => string | null = null; // For displaying the value in the table row
        // Convert column name to human-readable format



        if (columnKey.startsWith('meta_rel_') || columnKey.startsWith('roles_id')) {
          // Relational dropdown field
          fieldType = 'dropdown';
        
        // Handling options array
        var options: { value: string; title: string }[] = [];
        // const options = [];
        filter= {
          type: 'list', // Specify filter type as 'list' for dropdown
          config: {
            selectText: 'Select option', // Placeholder text
            list: []
          },
        };
        console.log(columnKey, 'columnKey');
        data.forEach((row) => {
            // Check if the row has a relevant field
            if (columnKey.indexOf('col_users')>-1 ) {
                options.push({
                    value: row.meta_user_id, // Use roles_id as the value
                    title: row.meta_text_first_name+" "+row.meta_text_last_name // Use roles_name as the title
                });
            }
        });
        if (columnKey.indexOf('roles_id')>-1 ) {
          console.log('herer',columnKey.indexOf('roles_id'));
            options = []; // reset options data if its roles column
            this.roles.data.forEach((row) => {
              // Check if the row has a relevant field
                  options.push({
                      value: row.id, // Use roles_id as the value
                      title: row.name// Use roles_name as the title
                  });
                 
          });
        }
        if (columnKey.indexOf('col_user')<0 && columnKey.indexOf('roles_id')<0) {
          // execeutes when the rel field is neither roles nor users. could be a collection
          options = []; // reset options data if its roles column
          this.collectionlist.collection.forEach((row) => {
            // Check if the row has a relevant field
                options.push({
                    value: row.id, // Use roles_id as the value
                    title: row.name// Use roles_name as the title
                });
               
        });
      }
        filter.config.list=options;
        
        // Remove duplicates from options
        const uniqueOptions = Array.from(
          new Map(options.map((option) => [option.value, option])).values()
        );
          // Format title by removing the "rel_" prefix and cleaning up
          const withoutRel = columnKey
            .replace(/^meta_rel/, '')
            .replace(/^rel_/, '')
            .replace(/_col.*$/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
          formattedTitle = withoutRel;
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
            console.log(uniqueOptions, 'uniqueOptions');
            // Check if the cell has a value and return it
            if (cell) {
              console.log('is cell');
              // Find the option that matches the cell value
              const selectedOption = uniqueOptions.find(option => option.value == cell);
              // Return the title of the selected option, or fallback to 'N/A' if not found
              return selectedOption ? selectedOption.title : 'N/A';
            }else{
              console.log('is not cell');
              return uniqueOptions[0]?.value;
            }
          };  
          
        }  else if (columnKey.startsWith('meta_text_')) {
          // Text field
          fieldType = 'text';
          editor = { type: 'input' };
          formattedTitle = columnKey
            .replace(/^meta_text_/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        } else if (columnKey.startsWith('meta_textarea_')) {
          // Textarea field
          fieldType = 'textarea';
          editor = { type: 'textarea' };
          formattedTitle = columnKey
            .replace(/^meta_textarea_/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        } else if (columnKey.startsWith('meta_file_')) {
            // File field
          fieldType = 'files';
          // File field
          fieldType = 'file';
          editor = {
            type: 'custom', // Use custom editor type
            component: FileUploadEditorComponent, // Specify editor component
          };
            formattedTitle = columnKey
              .replace(/^meta_file_/, '')
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (char) => char.toUpperCase());
        } else if (columnKey.startsWith('meta_date_')) {
          // this block is not working at the moment
          // Date field
          // fieldType = 'date';
          // editor = {
          //   type: 'input', // Use standard input
          //   config: {
          //     type: 'date', // Set the input type to date
          //   },
          // };
          formattedTitle = columnKey
            .replace(/^meta_date_/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        } else {
          // Default case for other columns
          formattedTitle = columnKey
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        }





        // formattedTitle = columnKey
        //   .replace(/_/g, ' ') // Replace underscores with spaces
        //   .replace(/meta/g, '') // Remove "meta" prefix
        //   .replace(/roles/g, 'role') // Replace "roles" with "role"
        //   .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
  
        // Add the column to dynamicColumns with its type
        dynamicColumns[columnKey] = {
          title: formattedTitle.trim(), // Use formatted title
          type: fieldType,
          editor: editor,
          filter: filter,
          valuePrepareFunction: valuePrepareFunction,
        };
      }
    });
    // Add a custom column for password
    dynamicColumns['password'] = {
      title: 'Password',
      type: 'string',
      filter: false,
      value: '*********'
    };
  
    // Merge dynamic columns into the existing settings while preserving actions
    this.settings = {
      ...this.settings, // Keep existing settings (including actions)
      columns: dynamicColumns, // Update only columns
    };
    // Select all elements with IDs starting with 'meta_date'

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
    console.log(event,'event');
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
  updateProfile(): void {
    // Collect updated form data and send to server
    const updatedProfileData = this.formData.reduce((acc, field) => {
      acc[field.key] = field.value;
      return acc;
    }, {});
    updatedProfileData['password']=this.password;
    console.log(updatedProfileData, 'Updated Profile Data',this.formData);

    // // Call your API service to update the profile
    this.usersService.updateUserProfile(updatedProfileData).subscribe(
      (response) => {
        console.log('Profile updated successfully:', response);
        alert('Profile updated successfully!');
      },
      (error) => {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
      }
    );
  }
  navigateToBlueprint(): void {
    this.router.navigate(['/pages/user/blueprint']); 
  }
  
  
}
