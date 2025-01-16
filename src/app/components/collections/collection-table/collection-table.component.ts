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
    
    // // Define a custom column for ID (this will be the sequential number column)
    // dynamicColumns['ID'] = {
    //   title: 'ID',
    //   type: 'string',
    //   valuePrepareFunction: (cell, row, rowIndex) => {
    //     // Return the rowIndex + 1 as the sequential number
    //     return (rowIndex + 1).toString(); // Ensure this returns a string
    //   },
    // };
    
    columns.forEach((column) => {
      // Define the columns you want to exclude or hide
      const hiddenColumns = ['id', 'collection_id', 'created_at', 'updated_at']; // Hide "id" column
    
      if (!hiddenColumns.includes(column)) {
        // Convert column name to human-readable format
        const formattedTitle = column
          .replace(/_/g, ' ') // Replace underscores with spaces
          .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
    
        dynamicColumns[column] = {
          title: formattedTitle, // Use formatted title
          type: 'string', // Default type; customize if necessary
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
