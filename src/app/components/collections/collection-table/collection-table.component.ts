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
          this.configureTableColumns(response.columns , response.data); // Dynamically configure columns
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
  
  


  configureTableColumns(columns: string[], data: any[]): void {
    const dynamicColumns: any = {};
    console.log(data);
  
    columns.forEach((column) => {
      // Define columns to exclude or hide
      const hiddenColumns = ['id', 'collection_id', 'created_at', 'updated_at'];
  
      if (!hiddenColumns.includes(column)) {
        let formattedTitle: string;
        let fieldType: string = 'string'; // Default field type
        let editor: any = null; // Default editor is null
        let valuePrepareFunction: (cell: any, row: any) => string | null = null; // For displaying the value in the table row
  
        if (column.startsWith('rel_')) {
          // Relational dropdown field
          fieldType = 'dropdown';
  
          // Format title by removing the "rel_" prefix and cleaning up
          const withoutRel = column
            .replace(/^rel_/, '')
            .replace(/_col.*$/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
  
          formattedTitle = withoutRel;
  
          const options = data
          .map((row) => {
            // Ensure row[column] is valid and an object
            if (row[column] && typeof row[column] === 'object' && row[column] !== null) {
              const { id, display } = row[column];
              return {
                value: id ? id.toString() : '', // Ensure id is converted to a string or fallback to empty string
                title: display || (id ? id.toString() : 'Unknown'), // Use display if available, otherwise fallback to id or "Unknown"
              };
            }
            return null; // Fallback for invalid or null entries
          })
          .filter((option) => option !== null); // Remove invalid options
        
          // Default "Please select an option" as the first dropdown item
          editor = {
            type: 'list',
            config: {
              list: [
                { value: '', title: 'Please select an option' }, // Default option
                ...options, // Add dynamic options
              ],
            },
          };
  
          // Display the selected option (or fallback to default if not available)
          valuePrepareFunction = (cell: any, row: any) => {
            if (cell && typeof cell === 'object') {
              return cell.display || cell.id || 'N/A'; // Display the readable name
            }
            return 'Please select an option'; // Default for unselected
          };
        } else if (column.startsWith('text_')) {
          // Text field
          fieldType = 'text';
          editor = { type: 'input' };
          formattedTitle = column
            .replace(/^text_/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        } else if (column.startsWith('textarea_')) {
          // Textarea field
          fieldType = 'textarea';
          editor = { type: 'textarea' };
          formattedTitle = column
            .replace(/^textarea_/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        } else if (column.startsWith('file_')) {
          // File field
          fieldType = 'files';
          editor = { type: 'file' };
          formattedTitle = column
            .replace(/^file_/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        } else if (column.startsWith('date_')) {
          // Date field
          fieldType = 'date';
          editor = { type: 'input' };
          formattedTitle = column
            .replace(/^date_/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        } else {
          // Default case for other columns
          formattedTitle = column
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        }
  
        // Assign column configuration
        dynamicColumns[column] = {
          title: formattedTitle,
          type: fieldType,
          editor: editor,
          valuePrepareFunction: valuePrepareFunction, // Ensure table rows display readable values
        };
      }
    });
  
    // Merge dynamic columns into existing table settings
    this.settings = {
      ...this.settings, // Keep other settings intact
      columns: dynamicColumns, // Replace or update columns
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
