import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { CollectionsService } from '../../services/collections.service';
import { LocalDataSource } from 'ng2-smart-table';
import { MENU_ITEMS } from '../../pages/pages-menu'; 
import { ReplacePipe } from '../../replace.pipe'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DatepickerComponent } from '../datepicker/datepicker.component'
import { FileUploadEditorComponent } from '../fileupload/file-upload-editor.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'ngx-smart-table',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  source: LocalDataSource = new LocalDataSource();
  currentEndpoint: string;
  currentPath: string;
  user_paths={profile:'', listings:'', all:''};
  singleuserdata=[];
  metaArray: { key: string; value: any }[] = [];
  formData: { key: string; value: any }[] = []; // New array to hold form data
  password='';
  selected_role:any;
  selected_employee:any;
  currentInsurers: any;
  vvgInsurers: any;
  genders: any;
  countries: any;
  permits: any;
  selected_current_insurer: any;
  selected_vvg_insurer: any;
  selected_gender: any;
  selected_nationality: any;
  selected_permit: any;
  roles:any;
  collectionlist:any;
  collectionHandle: string | null = null;
  currentUser=JSON.parse(localStorage.getItem('user'));
  rolename='';
  allusers:any;
  meta_rel_permit_req_col_permit:any;
  meta_rel_nationality_col_country:any;
  meta_rel_gender_req_col_gender:any;
  meta_rel_current_insurer_req_col_current_insurer:any;
  meta_rel_current_vvg_insurer_req_col_current_insurer:any;
  editUser:any;

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
    mode: 'external',
    tableTitle: '', 
    columns: {}, // Initially empty, populated dynamically
    pager: {
      perPage: 10, // Default items per page
    }

  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private collectionsService: CollectionsService
  ) {}

  ngOnInit(): void {
    this.rolename=this.currentUser.roles[0].name;
    // Select form fields by their IDs
    
    // a JS workaround to dynamicaly make inpit type date 
    const intervalId = setInterval(() => {
      // Select all input elements with placeholder containing 'date' (case-insensitive)
      const dateElements = Array.from(document.querySelectorAll('input[placeholder]'))
        .filter(el => el.getAttribute('placeholder')?.toLowerCase().includes('date'));
    
      // Iterate over the selected elements
      dateElements.forEach((element) => {
        const inputElement = element as HTMLInputElement;
        // console.log(inputElement, 'inputElement');
    
        // Change the input type to date if it's currently text
        if (inputElement.type === 'text') {
          inputElement.type = 'date';
        }
      });
    }, 2000);
   // Select all inputs with 'Phone' in id, name, or placeholder
    const phoneInputs = Array.from(document.querySelectorAll('input')).filter(input =>
      ['id', 'name', 'placeholder'].some(attr =>
        input.getAttribute(attr)?.toLowerCase().includes('Mobile')
      )
    );

    // Attach keyup event listener to all matched phone inputs
    phoneInputs.forEach(input => {
      input.addEventListener('keyup', function () {
        console.log('keyup');
        this.value = this.value.replace(/[^0-9]/g, ''); // Remove non-integer characters
      });
    });
    
    this.user_paths.profile='/pages/user/profile';
    this.user_paths.listings='/pages/users/list';
    this.user_paths.all='/pages/users/list/all';
    this.route.paramMap.subscribe((params) => {
      this.editUser=params.get('id');
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
      if(currentPath=='/pages/user/profile/create'){
        this.selected_role=3;
      }
      this.currentEndpoint = this.determineEndpoint(currentPath);
      console.log(this.currentEndpoint, 'this.currentEndpoint');
      this.usersService.listUsers('user/all').subscribe(
        (response) => { 
          this.allusers=response;
        },
        (error) => {
          console.error('Error fetching collection data:', error);
        }
      );
      this.usersService.listAdminUsers('user/all').subscribe(
        (response) => { 
          this.meta_rel_permit_req_col_permit=response.data[0].meta_rel_permit_col_permit_relationalDetails.allOptions;
          this.meta_rel_nationality_col_country=response.data[0].meta_rel_nationality_col_country_relationalDetails.allOptions;
          this.meta_rel_gender_req_col_gender=response.data[0].meta_rel_gender_req_col_gender_relationalDetails.allOptions;
          this.meta_rel_current_insurer_req_col_current_insurer=response.data[0].meta_rel_current_insurer_req_col_current_insurer_relationalDetails.allOptions;
          this.meta_rel_current_vvg_insurer_req_col_current_insurer=response.data[0].meta_rel_current_vvg_insurer_req_col_current_insurer_relationalDetails.allOptions;
          console.log(this.meta_rel_current_vvg_insurer_req_col_current_insurer, 'this.meta_rel_current_vvg_insurer_req_col_current_insurer');
        },
        (error) => {
          console.error('Error fetching collection data:', error);
        }
      );
      this.fetchUserData();
      
    });
    
    
  }

  // ... existing code ...

  captureFieldValue(value: string, index): void {
    console.log(value, 'captureFieldValue');
    // Update formData array based on input field changes
    if(index=='password'){
      this.password=value;
    }else if(index=='meta_rel_current_insurer_req_col_current_insurer'){
      this.selected_current_insurer=value;
    }else if(index=='meta_rel_current_vvg_insurer_req_col_current_insurer'){
      this.selected_vvg_insurer=value;
    }else if(index=='meta_rel_gender_req_col_gender'){
      this.selected_gender=value;
    }else if(index=='meta_rel_nationality_col_country'){
      this.selected_nationality=value;
    }else if(index=='meta_rel_permit_col_permit'){
      this.selected_permit=value;
    }else if(index==88){
      this.selected_role=value;
    }else if(index==99){
      this.selected_employee=value;
    }else{
      if (!this.formData[index]) {
        this.formData[index] = { ...this.metaArray[index] }; // Initialize if not already present
      }
      this.formData[index].value = value;
      console.log(this.formData, 'Current Form Data');
    }
  }
  isHidden(key: string): boolean {
    const hiddenFields = ['id', 'user_id', 'created_at', 'updated_at', 'last_login', 'employee_assigned','settings','meta_rel_employee_assigned_col_users','meta_rel_gender_req_col_gender', 'roles_id', 'roles_name', 'roles_created_at', 'roles_updated_at', 'roles_deleted_at', 'roles_guard_name', 'roles_deleted_at','meta_rel_current_insurer_req_col_current_insurer','meta_rel_current_vvg_insurer_req_col_current_insurer','meta_rel_gender_req_col_gender','meta_rel_nationality_col_country','meta_rel_permit_col_permit'];
    return hiddenFields.includes(key);
  }
  determineEndpoint(path: string): string {
    const endpointMapping: { [key: string]: string | ((match: RegExpMatchArray) => string) } = {
      '/dashboard': 'api/dashboard',
      '/pages/users/list': 'user/all', 
      '/pages/users/list/all': 'user/all',
      '/pages/user/profile': () => `user/detail/${this.usersService.currentUser.id}`,
      '/pages/user/profile/create': () => `user/detail/${this.usersService.currentUser.id}`,
      '/pages/user/profile/:id': (match) => `user/detail/${match[1]}`, // Handle dynamic user profile routes
      '/pages/password-reset/:hash': (match) => `password-reset/${match[1]}`, // Handle dynamic routes
    };
  
    // First, check for exact matches
    for (const route in endpointMapping) {
      if (path === route) {
        const value = endpointMapping[route];
        return typeof value === 'function' ? value(['']) : value;
      }
    }
  
    // Check for dynamic routes
    for (const route in endpointMapping) {
      const regex = new RegExp('^' + route.replace(/:([^/]+)/g, '([^/]+)') + '$'); // Convert :param to regex
      const match = path.match(regex);
      if (match) {
        const value = endpointMapping[route];
        return typeof value === 'function' ? value(match) : value;
      }
    }
  
    // Default fallback
    return '/api/collection';
  }
  

  fetchUserData(): void {
    const endpointWithHandle = `${this.currentEndpoint}`;
    console.log(endpointWithHandle, 'endpointWithHandle', this.user_paths.all+' this.user_paths.all');
    this.usersService.listUsers(endpointWithHandle).subscribe(
      (response) => {
        if(this.currentPath==this.user_paths.listings || this.currentPath==this.user_paths.all){
          console.log(response.columns,Array.isArray(response.columns),'Array.isArray(response.columns)');
          if (response && response.columns) {
            this.configureTableColumns(response.columns, response.data); // Dynamically configure columns
          }
          if (response && response.data && Array.isArray(response.data)) {
            this.source.load(response.data); // Populate table rows
          }
        }
        if(this.currentPath.includes('profile')){
          this.singleuserdata=response.data[0];
          this.metaArray = Object.entries(response.data[0]).map(([key, value]) => ({
            key,
            value,
          }));
          const excludedFields = ['name','created_at', 'updated_at','last_login', 'remember_token', 'email_verified_at', 'settings','meta_id', 'meta_created_at', 'meta_updated_at', 'meta_last_login', 'meta_settings', 'meta_user_id', 'email_verified_at','id','meta_employee_assigned'];
          const includeFields=['email','meta_text_last_name', 'meta_text_first_name', 'meta_text_mobile_req', 'text_password'];
          // Filter the metaArray to exclude certain fields
          // Filter metaArray based on current path
          if (this.currentPath === '/pages/user/profile') {
            // For profile page, only include specific fields
            this.metaArray = this.metaArray.filter(
              (field) => includeFields.includes(field.key)
            );

          } else {
           
            // For other paths, exclude certain fields
            this.metaArray = this.metaArray.filter(
              (field) => !excludedFields.includes(field.key)
            );
            if(!this.currentPath.includes('profile/create')){
              this.selected_role=this.getRoleValue();
            }
          }
          // this.metaArray = this.metaArray.filter(
          //   (field) => includeFields.includes(field.key)
          // );
          this.metaArray = this.metaArray.map((field) => ({
            ...field,
            displayKey: field.key.replace('meta_', '').replace('text_', '').replace('date_', '').replace('_req', '').replace('_', ' '), // Replace "meta_" with an empty string
            value: this.currentPath.includes('/profile/create') ? '' :  field.value || '',
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
      'Password',
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
      'updated_at'
    ];
    if(this.currentPath!=this.user_paths.all){
      hiddenColumns.push('roles_id');
      hiddenColumns.push('rel_employee_assigned_col_users');
      hiddenColumns.push('rel_gender_req_col_gender');
    }
    if(this.rolename!='admin'){
      hiddenColumns.push('roles_id');
      hiddenColumns.push('meta_rel_employee_assigned_col_users');
    }
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
        data.forEach((row) => {
            // Check if the row has a relevant field
            if (columnKey.indexOf('col_users')>-1 ) {
                // options.push({
                //     value: row.meta_user_id, // Use roles_id as the value
                //     title: row.meta_text_first_name+" "+row.meta_text_last_name // Use roles_name as the title
                // });
                var tempcol=columnKey+'_relationalDetails';
                console.log(tempcol, 'tempcol users');
                options = []; // reset options data if its roles column
                // columnKey=columnKey+'_relationalDetails';
                data.forEach((row) => {
                  if(typeof row[tempcol] !='undefined'){
                    // if (row[columnKey] && typeof row[columnKey] === 'object') {
                      const { allOptions } = row[tempcol].allOptions;
      
                      // if (Array.isArray(allOptions)) {
                        row[tempcol].allOptions.forEach((option) => {
      
                          options.push({
                            value: option.id,
                            title: option.display,
                          });
                        });
                      // }
                    // }
                  }
                  
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
        } else if (columnKey.indexOf('col_users')<0) {
          var tempcol=columnKey+'_relationalDetails';
          console.log(tempcol, 'tempcol');
          options = []; // reset options data if its roles column
          // columnKey=columnKey+'_relationalDetails';
          data.forEach((row) => {
            if(typeof row[tempcol] !='undefined'){
              // if (row[columnKey] && typeof row[columnKey] === 'object') {
                const { allOptions } = row[tempcol].allOptions;

                // if (Array.isArray(allOptions)) {
                  row[tempcol].allOptions.forEach((option) => {

                    options.push({
                      value: option.id,
                      title: option.display,
                    });
                  });
                // }
              // }
            }
            
          });
      }
        
        // Remove duplicates from options
        const uniqueOptions = Array.from(
          new Map(options.map((option) => [option.value, option])).values()
        );
        filter.config.list=uniqueOptions;
          // Format title by removing the "rel_" prefix and cleaning up
          const withoutRel = columnKey
            .replace(/^meta_rel/, '')
            .replace(/^rel_/, '')
            .replace(/^req/, '')
            .replace(/_col.*$/, '')
            .replace(/_users.*$/, '')
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
            // console.log(uniqueOptions, ' uniqueOptions ', cell);
            // Check if the cell has a value and return it
            if (cell) {
              
              // Find the option that matches the cell value
              const selectedOption = uniqueOptions.find(option => option.value == cell);
              // Return the title of the selected option, or fallback to 'N/A' if not found
              // console.log('is cell'+ selectedOption.title );
              return selectedOption ? selectedOption.title : 'N/A';
            }else{
              // console.log('is not cell'+ uniqueOptions[0]?.value);
              return 'N/A';
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
          // Date field
          fieldType = 'date';
          editor = {
            type: 'input',
            config: {
              type: 'date',
            },
          };
          formattedTitle = columnKey
            .replace(/^meta_date_/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());

          // Add valuePrepareFunction to format the date
          valuePrepareFunction = (date: string) => {
            if (!date) return '';
            const d = new Date(date);
            const day = d.getDate().toString().padStart(2, '0');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const year = d.getFullYear().toString().slice(-4);
            return `${day}/${month}/${year}`;
          };
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
          title: formattedTitle.trim().replace('Req', ''), // Use formatted title
          type: fieldType,
          editor: editor,
          filter: filter,
          valuePrepareFunction: valuePrepareFunction,
        };
      }
    });
    // Add a custom column for password
    // dynamicColumns['password'] = {
    //   title: 'Password',
    //   type: 'string',
    //   filter: false,
    //   value: '*********'
    // };
  
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
            // event.confirm.resolve(); // Notify the table of success
    
            // Show success alert
            window.alert('User deleted successfully!');
    
            // Refresh the table data
            this.fetchUserData();
          },
          (error) => {
            console.error('Error deleting entry:', error);
    
            // Show error alert
            window.alert('Failed to delete entry. Please try again.');
    
            // event.confirm.reject(); // Notify the table of failure
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
    const updatedProfileData = {};
    console.log( 'herere11');

    // Add form data with null checks
    if (this.formData && Array.isArray(this.formData)) {
      this.formData.forEach(field => {
        if (field && field.key && field.value !== undefined) {
          updatedProfileData[field.key] = field.value;
        }
      });
    }

    // Add role and employee if they exist
    if (this.selected_role) {
      updatedProfileData['roles_id'] = this.selected_role;
    }
    // if (this.selected_employee) {
      updatedProfileData['meta_rel_employee_assigned_col_users'] = this.selected_employee;
    // }
    // if (this.selected_current_insurer) {
      updatedProfileData['meta_rel_current_insurer_req_col_current_insurer'] = this.selected_current_insurer;
    // }
    // if (this.selected_vvg_insurer) {
      updatedProfileData['meta_rel_current_vvg_insurer_req_col_current_insurer'] = this.selected_vvg_insurer;
    // }
      //if (this.selected_gender) {
      updatedProfileData['meta_rel_gender_req_col_gender'] = this.selected_gender;
        // }
    // if (this.selected_nationality) {
      updatedProfileData['meta_rel_nationality_col_country'] = this.selected_nationality;
    // }
    // if (this.selected_permit) {
      updatedProfileData['meta_rel_permit_col_permit'] = this.selected_permit;
    // }
    
    if (this.password) {
      updatedProfileData['password'] = this.password;
    }
    var requiredFields=['email','meta_text_last_name', 'meta_text_first_name', 'meta_text_mobile_req'];
    var customerNonRequiredFields=['meta_rel_employee_assigned_col_users','meta_rel_permit_col_permit_id','meta_rel_permit_col_permit'];
    
    // Validate required fields
    const formElement = document.querySelector('.user-form');
    if (formElement) {
      const requiredInputs = formElement.querySelectorAll('[formfield]');
      console.log(requiredInputs, 'requiredInputs');
      for (const input of Array.from(requiredInputs)) {
        const inputElement = input as HTMLInputElement | HTMLSelectElement;
        // Skip validation for hidden fields
        const isHiddenField = this.isHidden(inputElement.id);
        console.log(!isHiddenField, !inputElement.value, inputElement.value.trim(), this.selected_role , this.rolename!='admin',  !customerNonRequiredFields.includes(inputElement.id),inputElement.id, 'all conditions');

        if (!isHiddenField && (!inputElement.value || inputElement.value.trim() === '') && (this.selected_role==3 || this.rolename!='admin') && !customerNonRequiredFields.includes(inputElement.id)) {
          // Get label text for the input
          const label = formElement.querySelector(`label[for="${inputElement.id}"]`);
          const fieldName = label ? label.textContent?.replace('*', '').trim() : inputElement.id;
          
          alert(`${fieldName} is required`);
          return;
        }
        if (!isHiddenField && (!inputElement.value || inputElement.value.trim() === '') && this.selected_role!=3 && requiredFields.includes(inputElement.id)) {
          // Get label text for the input
          const label = formElement.querySelector(`label[for="${inputElement.id}"]`);
          const fieldName = label ? label.textContent?.replace('*', '').trim() : inputElement.id;
          
          alert(`${fieldName} is required`);
          return;
        }
      }
    }

    // Get all phone input fields from the form
    const phoneInputElements = document.querySelectorAll('input[id*="phone"], input[id*="mobile"]');
    
    phoneInputElements.forEach(element => {
      const input = element as HTMLInputElement;
      if (input.value) {
        // Remove any non-digit characters
        const digitsOnly = input.value.replace(/\D/g, '');
        
        // Validate length is exactly 10 digits
        if (digitsOnly.length !== 10) {
          alert(`${input.id.replace(/meta_text_/g, '').replace(/req/g, '').replace(/_/g, ' ')} must be exactly 10 digits`);
          return;
        }
        // Validate that the value contains only numeric characters
        if (!/^[0-9]+$/.test(input.value)) {
          alert(`${input.id.replace(/meta_text_/g, '').replace(/req/g, '').replace(/_/g, ' ')} must contain only numeric values`);
          return;
        }
        // Update input value to contain only digits
        input.value = digitsOnly;
        
        // Update formData if field exists
        const fieldKey = input.id;
        const formField = this.formData?.find(f => f && f.key === fieldKey);
        if (formField) {
          formField.value = digitsOnly;
        }
      }
    });
    // Return early if phone/mobile validation failed
    for (const element of Array.from(phoneInputElements)) {
      const input = element as HTMLInputElement;
      if (input.value) {
        const digitsOnly = input.value.replace(/\D/g, '');
        
        if (digitsOnly.length !== 10) {
          return; // Stop submission if length validation failed
        }
        if (!/^[0-9]+$/.test(input.value)) {
          return; // Stop submission if numeric validation failed
        }
      }
    }

    // Only validate password for user creation
    if (this.currentPath.includes('/profile/create')) {
      if (!this.password || this.password.trim() === '') {
        alert('Password is required when creating a new user');
        return;
      }
    }

    // Validate date fields are not in future if present
    const dateFields = this.formData?.filter(f => f && f.key && f.key.toLowerCase().includes('date'));
    const today = new Date();
    today.setHours(0,0,0,0);
    
    for (const field of dateFields || []) {
      if (field && field.value) {
        const fieldDate = new Date(field.value);
        fieldDate.setHours(0,0,0,0);
        if (fieldDate > today) {
          alert(`${field.key.replace(/_/g, ' ')} cannot be a future date`);
          return;
        }
      }
    }
    console.log( 'herere');
    // Check if current path is profile/create
    if (this.currentPath.includes('/profile/create')) {
      // For new user creation
      if(this.rolename!='admin'){
        updatedProfileData['roles_id']=3;
        updatedProfileData['meta_rel_employee_assigned_col_users'] = this.currentUser.id;
      }
      this.usersService.createEntry(updatedProfileData).subscribe(
        (response) => {
          console.log('User created successfully:', response);
          alert('User created successfully!');
          this.router.navigate(['/pages/users/list/all']);
        },
        (error) => {
          console.error('Error creating user:', error);
          let errorMessage = 'Failed to create user. ';
          
          if (error.error && error.error.errors) {
            const errors = error.error.errors;
            for (const key in errors) {
              if (errors.hasOwnProperty(key)) {
                errors[key].forEach(message => {
                  errorMessage += `${key}: ${message} `;
                });
              }
            }
          }
          
          alert(errorMessage);
        }
      );
      return;
    }

    // For profile update
    console.log(updatedProfileData, 'updatedProfileData');
    this.usersService.updateUserProfile(updatedProfileData, this.editUser).subscribe(
      (response) => {
        console.log('Profile updated successfully:', response);
        alert('Profile updated successfully!');
        if (this.currentPath.includes('/profile/')) {
          this.router.navigate(['/pages/users/list/all']);
        }
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
  async exportToPdf() {
    const doc = new jsPDF();
  
    try {
      const tableData = await this.source.getAll();
      // Filter only required fields
      const selectedFields = ['email', 'meta_text_last_name', 'meta_text_first_name', 'meta_text_mobile_req'];
      
      // Get headers from settings for selected fields
      const headers = selectedFields.map(field => {
        return this.settings.columns[field]?.title || field;
      });

      // Build data rows with only selected fields
      const data = tableData.map(row => 
        selectedFields.map(field => row[field] || '')
      );
  
      autoTable(doc, {
        head: [headers],
        body: data,
      });
  
      doc.save('users.pdf');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  }
  
  async exportToPdfold() {
    const doc = new jsPDF();
    try {
      const tableData = await this.source.getAll(); // Await the promise here
      const headers = ['ID', 'Name', 'Email', 'Role']; // Define your table headers

      const data = tableData.map(item => [
        item.id,
        item.name,
        item.email,
        item.role,
      ]);

      autoTable(doc, {
        head: [headers],
        body: data,
      });

      doc.save('users.pdf');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  }

  // Export to Excel
  async exportToExcel() {
    try {
      const tableData = await this.source.getAll();
  
      // Get column keys and readable titles from settings
      const columns = Object.entries(this.settings.columns);
      console.log(columns, 'columns');
      const headers = columns.map(([key, value]: [string, any]) => value.title || key);
      
      // Create an array of objects with readable headers
      const formattedData = tableData.map(item => {
        const row: any = {};
        columns.forEach(([key, value], index) => {
          console.log(item, 'item[key]');
          console.log(headers[index], 'headers[index]');
          if(key.indexOf('_rel')!=-1){
            row[headers[index]] = item[key+'_relationalDetails'].selected.meta_title;
          }else{
            row[headers[index]] = item[key];
          }
        });
        return row;
      });
  
      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Customers');
      const excelFile = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([excelFile]), 'users.xlsx');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  }
  
  async exportToExcelold() {
    try {
      const tableData = await this.source.getAll(); // Await the promise here
      const ws = XLSX.utils.json_to_sheet(tableData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Users');
      const excelFile = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([excelFile]), 'users.xlsx');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  }
  exportaction(){
    
    window.location.href=environment.baseEndpoint+"users/downloads/excel";
  }
  
  onCreate(event: any): void {
    this.router.navigate(['/pages/user/profile/create']);
  }
  onDelete(event: any): void {
    alert('hello');
  }

  onEdit(event: any): void {
    this.router.navigate(['/pages/user/profile', event.data.id]);
  }

  getRoleValue(): any {
    const roleField = (this.metaArray?.find(m => m.key === 'roles_id'));
    if(typeof roleField != 'undefined'){
      return this.currentPath.includes('/profile/create') ? 3 : parseInt(roleField .value)|| 3;;
    }else{
      return roleField || 3;
    }
  }
  getCurrentInsurerValue(): any {
    const insurerField = (this.metaArray?.find(m => m.key === 'meta_rel_current_insurer_req_col_current_insurer'));
    if(typeof insurerField != 'undefined'){
      return this.currentPath.includes('/profile/create') ? '' : parseInt(insurerField .value)|| '';;
    }else{
      return insurerField || '';
    }
  }
  getVvgInsurerValue(): any {
    const insurerField = (this.metaArray?.find(m => m.key === 'meta_rel_current_vvg_insurer_req_col_current_insurer'));
    if(typeof insurerField != 'undefined'){
      return this.currentPath.includes('/profile/create') ? '' : parseInt(insurerField .value)|| '';;
    }else{
      return insurerField || '';
    }
  }
  getGenderValue(): any {
    const genderField = (this.metaArray?.find(m => m.key === 'meta_rel_gender_req_col_gender'));
    if(typeof genderField != 'undefined'){
      return this.currentPath.includes('/profile/create') ? '' : parseInt(genderField .value)|| '';;
    }else{
      return genderField || '';
    }
  }
  getNationalityValue(): any {
    const nationalityField = (this.metaArray?.find(m => m.key === 'meta_rel_nationality_col_country'));
    if(typeof nationalityField != 'undefined'){
      return this.currentPath.includes('/profile/create') ? '' : parseInt(nationalityField .value)|| '';;
    }else{
      return nationalityField || '';
    }
  }
  getPermitValue(): any {
    const permitField = (this.metaArray?.find(m => m.key === 'meta_rel_permit_col_permit'));
    if(typeof permitField != 'undefined'){
      return this.currentPath.includes('/profile/create') ? '' : parseInt(permitField .value)|| '';;
    }else{
      return permitField || '';
    }
  }
  getUserValue(): string {
    const userField = (this.metaArray?.find(m => m.key === 'meta_rel_employee_assigned_col_users'));
    if(typeof userField != 'undefined'){
      return this.currentPath.includes('/profile/create') ? '' : userField?.value || '';
    }else{
      return userField || '';
    }
  }
  isRequiredField(key: string): boolean {
    return key.includes('_req'); // Checks if '_req' exists anywhere in the key
  }
}
