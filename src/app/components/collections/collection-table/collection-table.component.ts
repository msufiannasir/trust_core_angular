import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionsService } from '../../../services/collections.service';
import { LocalDataSource } from 'ng2-smart-table';

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
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    edit: {
      editButtonContent: '<i class="nb-edit"></i>',
      saveButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
      confirmDelete: true,
    },
    columns: {}, // Initially empty, populated dynamically
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

  configureTableColumns(columns: string[]): void {
    const dynamicColumns: any = {};
    columns.forEach((column) => {
      // Convert column name to human-readable format
      const formattedTitle = column
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
  
      dynamicColumns[column] = {
        title: formattedTitle, // Use formatted title
        type: 'string', // Default type; customize if necessary
      };
    });

    // Merge dynamic columns into the existing settings while preserving actions
    this.settings = {
      ...this.settings, // Keep existing settings (including actions)
      columns: dynamicColumns, // Update only columns
    };
  }

  // onDeleteConfirm(event): void {
  //   if (window.confirm('Are you sure you want to delete?')) {
  //     event.confirm.resolve();
  //   } else {
  //     event.confirm.reject();
  //   }
  // }


  onCreateConfirm(event): void {
    if (this.collectionHandle) {
      this.collectionsService.createEntry(this.collectionHandle, event.newData).subscribe(
        (response) => {
          event.confirm.resolve(response);
        },
        (error) => {
          console.error('Error creating entry:', error);
          event.confirm.reject();
        }
      );
    } else {
      event.confirm.reject();
    }
  }
  
  onEditConfirm(event): void {
    if (this.collectionHandle) {
      this.collectionsService.updateEntry(this.collectionHandle, event.data.id, event.newData).subscribe(
        (response) => {
          event.confirm.resolve(response);
        },
        (error) => {
          console.error('Error updating entry:', error);
          event.confirm.reject();
        }
      );
    } else {
      event.confirm.reject();
    }
  }
  
  onDeleteConfirm(event): void {
    if (this.collectionHandle) {
      this.collectionsService.deleteEntry(this.collectionHandle, event.data.id).subscribe(
        (response) => {
          event.confirm.resolve(response);
        },
        (error) => {
          console.error('Error deleting entry:', error);
          event.confirm.reject();
        }
      );
    } else {
      event.confirm.reject();
    }
  }
  

}
