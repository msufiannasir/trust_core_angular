import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SiteSettingsService } from '../../services/site-settings.service';
import { environment } from '../../../environments/environment';
import { NbThemeService } from '@nebular/theme';
@Component({
  selector: 'ngx-smart-table',
  templateUrl: './sitesettings.component.html',
  styleUrls: ['./sitesettings.component.scss']
})
export class SitesettingsComponent implements OnInit {

  settingsForm!: FormGroup;
  settingsData: any = {};
  uploadedFiles: { [key: string]: File } = {}; // Store selected files

  addingField = false;  // Controls add field visibility
  deletingField = false; // Controls delete field visibility
  newFieldName: string = '';  // Stores new field name
  fieldToDelete: string = ''; // Stores field to delete

  constructor(private fb: FormBuilder, private siteSettingsService: SiteSettingsService) {}
  ngOnInit(): void {
    this.fetchSettings();

  }

  fetchSettings(): void {
    this.siteSettingsService.getSettings().subscribe(
      (data) => {
        this.settingsData = data.settings || {};
        this.initializeForm();
      },
      (error) => {
        console.error('Error fetching settings:', error);
      }
    );
  }

  initializeForm(): void {
    this.settingsForm = this.fb.group({});
    Object.keys(this.settingsData).forEach((key) => {
      this.settingsForm.addControl(key, this.fb.control(this.settingsData[key]));
    });
  }

  toTitleCase(str: string): string {
    return str.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }

  getInputType(key: string): string {
    if (key.includes('logo') || key.includes('image') || key.includes('file')) return 'file';
    if (key.includes('date')) return 'date';
    if (key.includes('phone')) return 'number';
    if (key.includes('email')) return 'email';
    return 'text';
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  onFileChange(event: any, key: string): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFiles[key] = file;
    }
  }

  onSubmit(): void {
    const formData = new FormData();
    
    Object.keys(this.settingsForm.value).forEach((key) => {
      const value = this.settingsForm.value[key];

      if (this.getInputType(key) === 'file' && this.uploadedFiles[key]) {
        formData.append(key, this.uploadedFiles[key]); // Append the new file
      } else {
        formData.append(key, value);
      }
    });

    this.siteSettingsService.updateSettings(formData).subscribe(
      (response) => {
        console.log('Settings updated successfully', response);
        alert('Settings updated successfully');
        this.fetchSettings(); // Reload the settings
      },
      (error) => {
        console.error('Error updating settings:', error);
        alert('Error updating settings');
      }
    );
  }

  getFullImageUrl(imagePath: string): string {
    return imagePath ? `${environment.backendbaseEndpoint}storage/${imagePath}` : '';
  }

  // Show the add new field input
  showAddField(): void {
    this.addingField = true;
    this.deletingField = false;
  }

  // Show delete field dropdown
  showDeleteField(): void {
    this.deletingField = true;
    this.addingField = false;
  }

  // Cancel add/delete operations
  cancelOperation(): void {
    this.addingField = false;
    this.deletingField = false;
    this.newFieldName = '';
    this.fieldToDelete = '';
  }

  // Add a new field
addNewField(): void {
  if (!this.newFieldName.trim()) {
    alert('Field name cannot be empty');
    return;
  }

  // Create a FormData instance
  const formData = new FormData();
  
  // Append the new field name with an empty value
  formData.append(this.newFieldName, '');

  // Send the FormData to the API
  this.siteSettingsService.updateSettings(formData).subscribe(
    (response) => {
      alert('New field added successfully');
      this.fetchSettings(); // Reload settings after adding new field
      this.cancelOperation(); // Hide add field operation
    },
    (error) => {
      console.error('Error adding new field:', error);
      alert('Error adding field');
    }
  );
}


  onAddFieldSubmit(): void {
    if (!this.newFieldName.trim()) {
      alert('Please enter a field name');
      return;
    }
  
    // Create a FormData instance
    const formData = new FormData();
    
    // Add the new field with an empty value
    formData.append(this.newFieldName, '');
  
    // Send the FormData to the API
    this.siteSettingsService.updateSettings(formData).subscribe(
      (response) => {
        console.log('Field added successfully', response);
        this.settingsData = response.settings || {}; // Update settings
        this.initializeForm(); // Reinitialize the form with updated settings
        this.addingField = false; // Hide the new field input
        this.newFieldName = ''; // Reset input
      },
      (error) => {
        console.error('Error adding field:', error);
        alert('Error adding field');
      }
    );
  }
  
    
  // Delete a field
  deleteField(): void {
    if (!this.fieldToDelete) {
      alert('Please select a field to delete');
      return;
    }

    this.siteSettingsService.deleteField(this.fieldToDelete).subscribe(
      (response) => {
        alert('Field deleted successfully');
        this.fetchSettings();
        this.cancelOperation();
      },
      (error) => {
        console.error('Error deleting field:', error);
        alert('Error deleting field');
      }
    );
  }
}
