import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { LocalDataSource } from 'ng2-smart-table';
import { MENU_ITEMS } from '../../pages/pages-menu';
import { ReplacePipe } from '../../replace.pipe';
import { DatepickerComponent } from '../datepicker/datepicker.component';
import { FileUploadEditorComponent } from '../fileupload/file-upload-editor.component';

@Component({
  selector: 'ngx-smart-table',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  source: LocalDataSource = new LocalDataSource(); // Data source for the smart table
  currentEndpoint: string;
  currentPath: string;
  user_paths = { profile: '', listings: '' }; // Paths for user navigation
  singleuserdata = [];
  metaArray: { key: string; value: any }[] = []; // Holds user metadata
  formData: { key: string; value: any }[] = []; // Form data for user profile updates
  password = ''; // Password field for profile updates

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
    tableTitle: '', // Table title
    columns: {}, // Dynamically populated table columns
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
    // Dynamically change input types to "date"
    const intervalId = setInterval(() => {
      const dateElements = document.querySelectorAll('[ng-reflect-name^="meta_date"]');
      dateElements.forEach((element) => {
        const inputElement = element as HTMLInputElement;
        if (inputElement.type === 'text') {
          inputElement.type = 'date';
        }
      });
    }, 2000);

    this.user_paths.profile = '/pages/user/profile';
    this.user_paths.listings = '/pages/users/list';

    // Handle route parameter changes
    this.route.paramMap.subscribe((params) => {
      const handle = params.get('handle');
      this.currentPath = this.router.url;
      this.currentEndpoint = this.determineEndpoint(this.currentPath);
      this.fetchUserData();
    });
  }

  // Capture field values for updates
  captureFieldValue(value: string, index: any): void {
    if (index === 'password') {
      this.password = value;
    } else {
      if (!this.formData[index]) {
        this.formData[index] = { ...this.metaArray[index] };
      }
      this.formData[index].value = value;
    }
  }

  // Check if a field should be hidden
  isHidden(key: string): boolean {
    const hiddenFields = ['id', 'user_id', 'created_at', 'updated_at', 'last_login', 'employee_assigned', 'settings'];
    return hiddenFields.includes(key);
  }

  // Map route paths to API endpoints
  determineEndpoint(path: string): string {
    const endpointMapping: { [key: string]: string } = {
      '/dashboard': 'api/dashboard',
      '/pages/users/list': 'user/all',
      '/pages/user/profile': `user/detail/${this.usersService.currentUser.id}`,
    };

    for (const route in endpointMapping) {
      if (path.includes(route)) {
        return endpointMapping[route];
      }
    }

    return '/api/collection';
  }

  // Fetch user data from API
  fetchUserData(): void {
    this.usersService.listUsers(this.currentEndpoint).subscribe(
      (response) => {
        if (this.currentPath === this.user_paths.listings) {
          if (response?.columns) {
            this.configureTableColumns(response.columns, response.data);
          }
          if (response?.data && Array.isArray(response.data)) {
            this.source.load(response.data);
          }
        }

        if (this.currentPath === this.user_paths.profile) {
          this.metaArray = Object.entries(response.data[0]).map(([key, value]) => ({
            key,
            value,
          }));

          const excludedFields = [
            'name', 'created_at', 'updated_at', 'roles_id', 'roles_name', 'last_login',
            'remember_token', 'email_verified_at', 'settings', 'id', 'meta_employee_assigned',
          ];

          this.metaArray = this.metaArray.filter((field) => !excludedFields.includes(field.key));
          this.metaArray = this.metaArray.map((field) => ({
            ...field,
            displayKey: field.key.replace('meta_', ''),
          }));
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  // Configure table columns dynamically
  configureTableColumns(columns: { [key: string]: string }, data: any[]): void {
    const dynamicColumns: any = {};
    const hiddenColumns = ['name', 'id', 'collection_id', 'roles_created_at', 'roles_updated_at', 'settings'];

    Object.keys(columns).forEach((columnKey) => {
      if (!hiddenColumns.includes(columnKey)) {
        let formattedTitle = columnKey.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
        dynamicColumns[columnKey] = { title: formattedTitle, type: 'string' };
      }
    });

    dynamicColumns['password'] = {
      title: 'Password',
      type: 'string',
      filter: false,
    };

    this.settings = { ...this.settings, columns: dynamicColumns };
  }

  // Handle delete confirmation
  onDeleteConfirm(event): void {
    const handle = this.route.snapshot.paramMap.get('handle');
    const entryId = event.data.id;

    if (entryId && confirm(`Are you sure to delete user ${event.data.name}`)) {
      this.usersService.deleteEntry(handle, entryId).subscribe(
        () => {
          event.confirm.resolve();
          alert('User deleted successfully!');
          this.fetchUserData();
        },
        (error) => {
          console.error('Error deleting entry:', error);
          alert('Failed to delete entry.');
          event.confirm.reject();
        }
      );
    } else {
      event.confirm.reject();
    }
  }

  // Handle profile update
  updateProfile(): void {
    const updatedProfileData = this.formData.reduce((acc, field) => {
      acc[field.key] = field.value;
      return acc;
    }, {});
    updatedProfileData['password'] = this.password;

    this.usersService.updateUserProfile(updatedProfileData).subscribe(
      () => alert('Profile updated successfully!'),
      (error) => {
        console.error('Error updating profile:', error);
        alert('Failed to update profile.');
      }
    );
  }
}
