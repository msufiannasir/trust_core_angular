import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import { UsersService } from '../../../services/users.service';
import { CollectionsService } from '../../../services/collections.service';

interface UserFieldsResponse {
  fields: {
    [key: string]: any;
  };
}

@Component({
  selector: 'ngx-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
  metaArray: { key: string; value: any }[] = [];
  formData: { key: string; value: any }[] = [];
  validationErrors: { [key: string]: boolean } = {};
  currentUser = JSON.parse(localStorage.getItem('user'));
  rolename = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: NbToastrService,
    private usersService: UsersService,
    private collectionsService: CollectionsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    alert('fetchUserFields');

    this.rolename = this.currentUser.roles[0].name;
    this.fetchUserFields();
  }

  isHidden(key: string): boolean {
    const hiddenFields = ['id', 'user_id', 'collection_id', 'created_at', 'updated_at', 'last_login', 'employee_assigned', 'settings'];
    return hiddenFields.includes(key);
  }

  fetchUserFields(): void {
    this.usersService.getUserFields().subscribe(
      (response: UserFieldsResponse) => {
        console.log('API Response:', response);
        this.metaArray = Object.entries(response.fields).map(([key, value]) => {
          if (this.isDropdownField(key) && typeof value === 'object' && value !== null) {
            const val = value as any;
            return {
              key,
              value: val.selected ? val.selected.id : '',
              displayKey: this.formatDisplayKey(key),
              isRequiredField: this.isRequiredField(key),
              allOptions: val.allOptions || [],
              groups: val.groups || {}
            };
          }
          return {
            key,
            value: value ?? '',
            displayKey: this.formatDisplayKey(key),
            isRequiredField: this.isRequiredField(key),
            allOptions: []
          };
        });
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching user fields:', error);
      }
    );
  }

  captureFieldValue(value: string, index: number): void {
    if (!this.formData[index]) {
      this.formData[index] = { ...this.metaArray[index] };
    }
    this.formData[index].value = value;
  }

  validateFields(data: any): boolean {
    this.validationErrors = {};
    let hasErrors = false;
    Object.keys(data).forEach((key) => {
      if (key.includes('_req') && (!data[key] || data[key] === '')) {
        this.validationErrors[key] = true;
        hasErrors = true;
      }
    });
    return !hasErrors;
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    const userData = {};
    this.metaArray.forEach(field => {
      userData[field.key] = field.value;
    });

    if (!this.validateFields(userData)) {
      alert('Please enter all required information');
      return;
    }

    this.usersService.createUser(userData).subscribe(
      (response) => {
        console.log('User created successfully:', response);
        this.toastrService.success('User created successfully!', 'Success');
        this.router.navigate(['/pages/users/list']);
      },
      (error) => {
        console.error('Error creating user:', error);
        this.toastrService.danger('Failed to create user. Please try again.', 'Error');
      }
    );
  }

  onCancel(): void {
    this.router.navigate(['/pages/users/list']);
  }

  isTextField(key: string): boolean {
    return key.startsWith('text_');
  }

  isDateField(key: string): boolean {
    return key.startsWith('date_');
  }

  isTextareaField(key: string): boolean {
    return key.startsWith('textarea_');
  }

  isFileField(key: string): boolean {
    return key.startsWith('file_') || key.startsWith('image_') || key.startsWith('files_') || 
           key.startsWith('images_') || key.startsWith('upload_') || key.startsWith('uploads_');
  }

  isDropdownField(key: string): boolean {
    return key.startsWith('rel_');
  }

  formatDisplayKey(key: string): string {
    let displayKey = key;
    displayKey = displayKey.replace(/^(meta_|text_meta|date_|text_|textarea_|file_)/, '');
    displayKey = displayKey.replace(/^rel_/, '').replace(/_col_.+$/, '');
    displayKey = displayKey.replace(/_req/g, '');
    displayKey = displayKey
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
    return displayKey;
  }

  isRequiredField(key: string): boolean {
    return key.includes('_req');
  }
} 