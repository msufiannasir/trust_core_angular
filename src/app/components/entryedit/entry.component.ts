import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { CollectionsService } from '../../services/collections.service';
import { LocalDataSource } from 'ng2-smart-table';
import { Location } from '@angular/common'; 
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'ngx-smart-table',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
})
export class EditEntry implements OnInit {
  source: LocalDataSource = new LocalDataSource();
  currentPath: string;
  collectionHandle: string | null = null;
  entryId: string | null = null;
  metaArray: { key: string; value: any }[] = [];
  formData: { key: string; value: any }[] = [];
  additionalForms: any[] = []; 
  showRedirectButton: boolean = false; 
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private collectionsService: CollectionsService,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private http: HttpClient
  ) {}
  goBack(): void {
    this.location.back();  // Navigate to the previous page
  }
  ngOnInit(): void {
    this.currentPath = this.router.url.split('?')[0]; 
    console.log("Current Path:", this.currentPath);
    this.route.paramMap.subscribe((params) => {
      this.collectionHandle = params.get('handle');
      this.entryId = params.get('entryId');
      console.log("this.collectionHandle:", this.collectionHandle);
      console.log(" this.entryId",  this.entryId);
      if (this.collectionHandle && this.entryId) {
        this.fetchEntryData();
      }else if (this.collectionHandle){
        this.fetchEntryFields();
      }
    });
  }
  isHidden(key: string): boolean {
    const hiddenFields = ['id', 'user_id', 'collection_id', 'created_at', 'updated_at', 'last_login', 'employee_assigned', 'settings'];
    return hiddenFields.includes(key);
  }
  fetchEntryData(): void {
    if (this.collectionHandle && this.entryId) {
      this.collectionsService.getEntryDetail(this.collectionHandle, this.entryId).subscribe(
        (response) => {
          console.log('API Response:', response);
          // Map response to metaArray
          this.metaArray = Object.entries(response.entry).map(([key, value]) => {
            if (this.isDropdownField(key) && typeof value === 'object' && value !== null) {
              const val = value as any; // Bypass TypeScript's strict checks
              return {
                key,
                value: val.selected ? val.selected.id : '', // Access selected ID safely
                displayKey: key.replace(/_/g, ' '),
                allOptions: val.allOptions || [] // Ensure allOptions exist
              };
            }

          
  
            return {
              key,
              value: value ?? '', // Default to empty string if value is null
              displayKey: key.replace(/_/g, ' '),
              allOptions: [] // Empty array for non-dropdown fields
            };
          });
          this.showRedirectButton = this.collectionHandle === "templates";
          console.log('Updated Meta Array:', this.metaArray);
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error fetching entry data:', error);
          this.showRedirectButton = false; // Hide the button if API call fails
        }

      );
    }
  }
  fetchEntryFields(): void {
    if (this.collectionHandle) {
      this.collectionsService.getCollectionsFields(this.collectionHandle).subscribe(
        (response) => {
          console.log('API Response:', response);
          // Map response to metaArray
          this.metaArray = Object.entries(response.fields).map(([key, value]) => {
            if (this.isDropdownField(key) && typeof value === 'object' && value !== null) {
              const val = value as any; // Bypass TypeScript's strict checks
              return {
                key,
                value: val.selected ? val.selected.id : '', // Access selected ID safely
                displayKey: key.replace(/_/g, ' '),
                allOptions: val.allOptions || [] // Ensure allOptions exist
              };
            }
            return {
              key,
              value: value ?? '', // Default to empty string if value is null
              displayKey: key.replace(/_/g, ' '),
              allOptions: [] // Empty array for non-dropdown fields
            };
          });
          this.showRedirectButton = this.collectionHandle === "templates";
          console.log('Updated Meta Array:', this.metaArray);
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error fetching entry fields:', error);
          this.showRedirectButton = false;
        }
      );
    }
  } 
  onDropdownChange(fieldKey: string, selectedValue: any): void {
    console.log("Dropdown changed:", { fieldKey, selectedValue });
    if (!fieldKey || selectedValue === undefined) {
      console.error("Error: fieldKey or selectedValue is undefined!", { fieldKey, selectedValue });
      return;
    }
    const match = fieldKey.match(/^rel_.*_col_(\w+)$/);
    if (match && match[1] === 'templates') {
      this.collectionHandle = 'templates';  // Set the collection to "templates"
      this.entryId = selectedValue;  // Set the entry ID to selected value
      console.log(`Updated collectionHandle: ${this.collectionHandle}, entryId: ${this.entryId}`);
      if (this.collectionHandle && this.entryId) {
        this.fetchEntryData(); // Now, it should send the request to the correct "templates" URL
      }
    }
  }
  captureFieldValue(value: string, index: number): void {
    if (!this.formData[index]) {
      this.formData[index] = { ...this.metaArray[index] };
    }
    this.formData[index].value = value;
  }
  handleFileUpload(event: Event, key: string, index: number): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.formData[index] = {
        key,
        value: fileInput.files[0] // Store the uploaded file
      };
    }
  }
  onSubmit(event: Event, redirect: boolean = false): void {
    event.preventDefault();
    if (!this.collectionHandle) {
      console.error('Missing collection handle or entry ID.');
      return;
    }
    const updatedData = {};
    this.metaArray.forEach(field => updatedData[field.key] = field.value);
    // if (this.currentPath.startsWith('/pages/templates/entry/') || this.currentPath.startsWith('/pages/offers/entry/') || this.currentPath.startsWith('/pages/offers/create/') || this.currentPath.startsWith('/pages/templates/create/')) {
      if (redirect) {
        this.sendDataToAnotherUrl();
      }
    // }
    if (this.entryId) {
    this.collectionsService.updateEntry(this.collectionHandle, this.entryId, updatedData).subscribe(
      (response) => {
        console.log('Update Response:', response);
        window.alert(response.message || 'Entry updated successfully!');
        this.fetchEntryData(); 
      },
      (error) => {
        console.error('Error updating entry:', error);
        window.alert('Failed to update entry. Please try again.');
      }
    );
  } else {
    this.collectionsService.createEntry(this.collectionHandle, updatedData).subscribe(
      (response) => {
        // event.confirm.resolve(response); // Notify the table of success

        // Show success alert
        window.alert('Entry created successfully!');

        // Refresh the table data
        // this.fetchCollectionData(handle);
      },
      (error) => {
        console.error('Error creating entry:', error);

        // Show error alert
        window.alert('Failed to create entry. Please try again.');

      }
    );

  }
  }
  // sendDataToAnotherUrl(): void {
  //   const queryParams = new URLSearchParams();
  //   this.metaArray.forEach(field => {
  //     if (!this.isHidden(field.key)) { 
  //       queryParams.append(field.key, field.value);
  //     }
  //   });
  //   const targetUrl = `http://localhost:4200/api/receive-data?${queryParams.toString()}`;
  //   console.log('Generated URL:', targetUrl); 
  //   // Open the URL in a new tab
  //   window.open(targetUrl, '_blank');
  // }


  sendDataToAnotherUrl(): void {
    const postData = this.metaArray
      .filter(field => !this.isHidden(field.key)) // Remove hidden fields
      .reduce((acc, field) => ({ ...acc, [field.key]: field.value }), {}); // Convert to object

    const targetUrl = 'http://localhost:4200/api/send-data'; // Replace with actual API URL

    // Send POST request without subscribing (ignoring response)
    this.http.post(targetUrl, postData).subscribe({
      complete: () => console.log('POST request sent successfully.') // Optional log
    });
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
    return key.startsWith('image_') || key.startsWith('file_');
  }
  isDropdownField(key: string): boolean {
    return key.startsWith('rel_');
  }

  navigateToBlueprint(): void {
    // Get the full URL path as an array of segments
    const urlSegments = this.route.snapshot.url.map(segment => segment.path);
    console.log("URL Segments: ", urlSegments);
  
    // Find the segment that starts with "template_" (assuming template handles start with "template_")
    const basePath = urlSegments.find(segment => segment.startsWith('template_'));
  
    if (!basePath) {
      console.error("Template handle not found in URL!");
      return;
    }
  
    // Construct the correct blueprint URL
    const blueprintUrl = `/pages/${basePath}/blueprint`;
    console.log("Navigating to: " + blueprintUrl);
  
    // Navigate to the constructed URL
    this.router.navigateByUrl(blueprintUrl).catch((error) => {
      console.error('Navigation error:', error);
    });
  }
  
  
}
