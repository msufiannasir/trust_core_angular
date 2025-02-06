import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NbCardModule } from '@nebular/theme';
import { UsersService } from '../../services/users.service';
import { CollectionsService } from '../../services/collections.service';
import { LocalDataSource } from 'ng2-smart-table';
import { MENU_ITEMS } from '../../pages/pages-menu'; 
import { ReplacePipe } from '../../replace.pipe'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DatepickerComponent } from '../datepicker/datepicker.component';
import { FileUploadEditorComponent } from '../fileupload/file-upload-editor.component';
import { environment } from '../../../environments/environment';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'ngx-smart-table',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
})
export class EditEntry implements OnInit {
  source: LocalDataSource = new LocalDataSource();
  currentEndpoint: string;
  currentPath: string;
  user_paths = { offers: '', contracts: '' };
  singleuserdata = [];
  metaArray: { key: string; value: any }[] = [];
  formData: { key: string; value: any }[] = []; // New array to hold form data
  password = '';
  roles: any;
  collectionlist: any;
  collectionHandle: string | null = null;
  entryId: string | null = null;
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
    private collectionsService: CollectionsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentPath = this.router.url.split('?')[0]; // Remove query params
    console.log("Current Path:", this.currentPath);

    // Dynamically change input type to date
    const intervalId = setInterval(() => {
      const dateElements = document.querySelectorAll('[ng-reflect-name^="meta_date"]');
      dateElements.forEach((element) => {
        const inputElement = element as HTMLInputElement;
        if (inputElement.type === 'text') {
          inputElement.type = 'date';
        }
      });
    }, 2000);

    this.user_paths.contracts = '/pages/contracts/entry/';
    this.user_paths.offers = '/pages/offers/entry';

    this.route.paramMap.subscribe((params) => {
      this.collectionHandle = params.get('handle');
      this.entryId = params.get('entryId');
      console.log('Collection Handle:', this.collectionHandle);
      console.log('Entry ID:', this.entryId);

      if (this.collectionHandle && this.entryId) {
        this.fetchEntryData();
      }
    });

    this.collectionsService.getCollections().subscribe(
      (response) => {
        this.collectionlist = response;
        console.log(this.collectionlist, 'this.collections');
      },
      (error) => {
        console.error('Error fetching collection data:', error);
      }
    );
  }

  isHidden(key: string): boolean {
    const hiddenFields = ['id', 'user_id','collection_id', 'created_at', 'updated_at', 'last_login', 'employee_assigned', 'settings'];
    return hiddenFields.includes(key);
  }

  fetchEntryData(): void {
    if (this.collectionHandle && this.entryId) {
      this.collectionsService.getEntryDetail(this.collectionHandle, this.entryId).subscribe(
        (response) => {
          console.log('API Response:', response);
          // Extract the entry object from the response
          const entry = response.entry;
          console.log("entry "+ entry);
          // Dynamically generate form fields
          this.metaArray = Object.entries(entry).map(([key, value]) => ({
            key,
            value,
            displayKey: key.replace(/_/g, ' '), // Replace underscores with spaces for display
          }));
  
          
          console.log('Form Fields:', this.metaArray);
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error fetching entry data:', error);
        }
      );
    }
  }

  captureFieldValue(value: string, index): void {
    console.log(value, 'captureFieldValue');
    // Update formData array based on input field changes
      if (!this.formData[index]) {
        this.formData[index] = { ...this.metaArray[index] }; // Initialize if not already present
      }
      this.formData[index].value = value;
      console.log(this.formData, 'Current Form Data');
  }
  onSubmit(event): void {
    const handle = this.route.snapshot.paramMap.get('handle'); // Get the collection handle
    const entryId = this.route.snapshot.paramMap.get('entryId');; // Fetch the entry ID if needed (could be from a route or other source)
  
    // Create an object with the form data
    const updatedData = {};
    this.metaArray.forEach(field => {
      updatedData[field.key] = field.value; // Collect key-value pairs from the form fields
    });
  
    // Check if handle and entryId are available
    if (handle && entryId) {
      this.collectionsService.updateEntry(handle, entryId, updatedData).subscribe(
        (response) => {
          // Resolve the event (successful update)
          event.confirm.resolve(response);
          
          // Show success alert
          window.alert('Entry updated successfully!');
          
          // Optionally refresh the collection data after update
          // this.fetchCollectionData(handle);
        },
        (error) => {
          // Log and handle error
          console.error('Error updating entry:', error);
          
          // Show error alert
          window.alert('Failed to update entry. Please try again.');
          
          // Reject the event on failure
          event.confirm.reject();
        }
      );
    } else {
      // Reject if handle or entryId is missing
      event.confirm.reject();
    }
  }
  
  // Utility function to get the entry ID (you can fetch it based on your specific logic)
  getEntryId(): string {
    // Logic to get the entry ID (e.g., from route, form, or other sources)
    return "some-entry-id"; // Example placeholder
  }
  
  
}