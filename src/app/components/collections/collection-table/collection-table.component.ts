import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionsService } from '../../../services/collections.service';
import { LocalDataSource } from 'ng2-smart-table';
import { MENU_ITEMS } from '../../../pages/pages-menu'; 

@Component({
  selector: 'ngx-smart-table',
  templateUrl: './collection-table.component.html',
  styleUrls: ['./collection-table.component.scss'],
})
export class CollectionTableComponent implements OnInit {
  collectionHandle: string | null = null;
  source: LocalDataSource = new LocalDataSource();
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
    private collectionsService: CollectionsService
  ) {}

  ngOnInit(): void {
    // Check if 'handle' exists in the current route
    this.route.paramMap.subscribe((params) => {
      const handle = params.get('handle');
      
      // Ensure only requests with a valid 'handle' are processed
      if (handle) {
        this.fetchCollectionData(handle);
        this.setTableTitle(handle);
      } else {
        console.warn('No handle provided in the route. Skipping data fetch.');
      }
    });
  }

  fetchCollectionData(handle: string): void {
    const endpoint = `/collections/show/${handle}`;
    this.collectionsService.getDynamicData(endpoint).subscribe(
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

  setTableTitle(handle: string): void {
    console.log('Handle:', handle); // Log the handle
    const menuItem = MENU_ITEMS.find(item => item.link.includes(handle));
    if (menuItem) {
      this.settings.tableTitle = menuItem.title;
    }
  }
  
  


  configureTableColumns(columns: string[]): void {
    const dynamicColumns: any = {};
    
    columns.forEach((column) => {
      // Define the columns you want to exclude or hide
      const hiddenColumns = ['id', 'collection_id', 'created_at', 'updated_at']; // Hide "id" column
  
      if (!hiddenColumns.includes(column)) {
        let formattedTitle: string;
        let fieldType: string = 'string'; // Default type to string
        // Check for "rel_" columns first (Relation field)
        if (column.startsWith('rel_')) {
          fieldType = 'dropdown'; // Set to dropdown type
          // Remove the "rel_" prefix and handle _col and extra parts
          let withoutRel = column.replace(/^rel_/, ''); // Remove "rel_" prefix
          // Remove the "_col" suffix and any extra parts after the last underscore
          withoutRel = withoutRel.replace(/_col.*$/, ''); // Remove "_col" and anything after it (like "_insurance")
          // Now we have the core part of the column name (e.g., "insurance_type" instead of "insurance_type_col_insurance")
          formattedTitle = withoutRel.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()); // Format the title
        }
        // Handle other field types
        else if (column.startsWith('text_')) {
          fieldType = 'text'; // Set to text field type
          formattedTitle = column.replace(/^text_/, '').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
        } else if (column.startsWith('textarea_')) {
          fieldType = 'textarea'; // Set to textarea field type
          formattedTitle = column.replace(/^textarea_/, '').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
        } else if (column.startsWith('file_')) {
          fieldType = 'files'; // Set to files type
          formattedTitle = column.replace(/^file_/, '').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
        } else if (column.startsWith('date_')) {
          fieldType = 'date'; // Set to date type
          formattedTitle = column.replace(/^date_/, '').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
        }  else { // Default formatting for other columns
          formattedTitle = column.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
        }
  
        // Assign the dynamic column properties
        dynamicColumns[column] = {
          title: formattedTitle, // Use formatted title
          type: fieldType, // Set field type dynamically
        };
      }
    });
  
    // Merge dynamic columns into the existing settings while preserving actions
    this.settings = {
      ...this.settings, // Keep existing settings (including actions)
      columns: dynamicColumns, // Update only columns
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
  
  

}
