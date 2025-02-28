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
  showBlueprintButton: boolean = false;
  bufferID;
  bufferHandle;
  offerID='';
  slug;
  validationErrors: { [key: string]: boolean } = {};
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
      this.slug=this.collectionHandle ;
      this.entryId = params.get('entryId');
      console.log("this.collectionHandle:", this.collectionHandle);
      console.log(" this.entryId",  this.entryId);
       // Check if any segment starts with "template_"
       this.showBlueprintButton = this.collectionHandle?.startsWith('template_') || false;
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
                displayKey: this.formatDisplayKey(key), // Call the separate function
                // displayKey: key.replace(/_/g, ' '),
                isRequiredField: this.isRequiredField(key),
                allOptions: val.allOptions || [] // Ensure allOptions exist
              };
            }

          
  
            return {
              key,
              value: value ?? '', // Default to empty string if value is null
              displayKey: this.formatDisplayKey(key), // Call the separate function
              // displayKey: key.replace(/_/g, ' '),
              isRequiredField: this.isRequiredField(key),
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
                displayKey: this.formatDisplayKey(key), // Call the separate function
                isRequiredField: this.isRequiredField(key),
                // displayKey: key.replace(/_/g, ' '),
                allOptions: val.allOptions || [] // Ensure allOptions exist
              };
            }
            return {
              key,
              value: value ?? '', // Default to empty string if value is null
              displayKey: this.formatDisplayKey(key), // Call the separate function
              isRequiredField: this.isRequiredField(key),
              // displayKey: key.replace(/_/g, ' '),
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
    console.log("match " + match);
    // const match = rel_templates_col_collections;
    // if (match === "rel_templates_col_collections") {
      this.bufferHandle = selectedValue;  // Set the collection to "templates"
      this.bufferID = '1';  // Set the entry ID to selected value
      console.log(`Updated collectionHandle: ${this.collectionHandle}, entryId: ${this.entryId}`);
      // if (this.collectionHandle && this.entryId) {
      //   this.fetchEntryData(); // Now, it should send the request to the correct "templates" URL
      // }
      // this.fetchEntryFields();
    // }
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
  validateFields(data) {
    this.validationErrors = {};
    let hasErrors = false;
    Object.keys(data).forEach((key) => {
      if (key.endsWith('_req') && (!data[key] || data[key].trim() === '')) {
        this.validationErrors[key] = true; // Mark field as invalid
        hasErrors = true;
      }
    });

    console.log('Validation Errors:', this.validationErrors);
    return !hasErrors;
  }
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
  loadTemplateData(){
    if(this.collectionHandle=='offers'){
      this.entryId=this.bufferID;
      this.collectionHandle=this.bufferHandle;
      this.fetchEntryData(); 
    }
  }
  onSubmit(event: Event, redirect: boolean = false): void {
    var confirmed;
    if(this.collectionHandle!='offers'){
      confirmed = window.confirm("Are you sure you want to submit?");
    }else{
      confirmed = window.confirm("Once you go to next step, you wont be able to get back. Are you sure?");
    }
    if (!confirmed) {
      return;
    }
    event.preventDefault();
    if (!this.collectionHandle) {
      console.error('Missing collection handle or entry ID.');
      return;
    }
    const updatedData = {};
    this.metaArray.forEach(field => updatedData[field.key] = field.value);
    console.log(updatedData, 'updatedData');
    var validateFields=this.validateFields(updatedData);
    if(!validateFields){
      alert('Please enter all required information');
      return ;
    }
    if(this.slug=='offers' && this.collectionHandle!='offers' && this.offerID!=''){
      updatedData['offerID']=this.offerID;
    }
    // if (this.currentPath.startsWith('/pages/templates/entry/') || this.currentPath.startsWith('/pages/offers/entry/') || this.currentPath.startsWith('/pages/offers/create/') || this.currentPath.startsWith('/pages/templates/create/')) {
      if (redirect) {
        this.sendDataToAnotherUrl();
      }
    // }
    if (this.entryId) {
    this.collectionsService.updateEntry(this.collectionHandle, this.entryId, updatedData).subscribe(
      (response) => {
        console.log('updateEntry');
        console.log('Update Response:', response);
        window.alert(response.message || 'Entry updated successfully!');
        if(this.slug=='offers'){
          this.loadTemplateData();
        }
        if(typeof response.offercreated !='undefined'){
          if(response.offercreated){
            this.router.navigateByUrl('/pages/offers').catch((error) => {
              console.error('Navigation error:', error);
            });
          }
        }

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
       console.log('createEntry');
        // Show success alert
        if(this.slug!='offers'){
          window.alert('Entry created successfully!');
        }
        if(this.slug=='offers'){
          this.offerID=response.id;
          this.loadTemplateData();
        }
        if(typeof response.offercreated !='undefined'){
          if(response.offercreated){
            this.router.navigateByUrl('/pages/offers').catch((error) => {
              console.error('Navigation error:', error);
            });
          }
        }
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
    return key.startsWith('image_') || key.startsWith('file_') || key.startsWith('files_') || key.startsWith('images_') || key.startsWith('upload_') || key.startsWith('uploads_');
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
  // Function to format the display key
  formatDisplayKey(key: string): string {
    let displayKey = key;
    // Remove specific prefixes
    displayKey = displayKey.replace(/^(meta_|text_meta|date_|text_|textarea_|file_)/, '');
    // Handle relationship fields
    displayKey = displayKey.replace(/^rel_/, '').replace(/_col_.+$/, '');
    // Remove all occurrences of "_req" anywhere in the string
    displayKey = displayKey.replace(/_req/g, '');
    // Convert snake_case to title case
    displayKey = displayKey
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
    return displayKey;
  }

  isRequiredField(key: string): boolean {
    return key.includes('_req'); // Checks if '_req' exists anywhere in the key
  }
  
}
