import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionsService } from '../../../services/collections.service';
import { LocalDataSource } from 'ng2-smart-table';
import { MENU_ITEMS } from '../../../pages/pages-menu';
import { DatepickerComponent } from '../../../pages/forms/datepicker/datepicker.component'
import { NbCardModule } from '@nebular/theme';
import { FileUploadEditorComponent } from '../../fileupload/file-upload-editor.component';


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
    const endpoint = `collections/show/${handle}`;
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
        // Handling options array
        const options: { value: string; title: string }[] = [];
        data.forEach((row) => {
          if (row[column] && typeof row[column] === 'object') {
            const { allOptions } = row[column];
            if (Array.isArray(allOptions)) {
              allOptions.forEach((option) => {
                options.push({
                  value: option.id.toString(),
                  title: option.display,
                });
              });
            }
          }
        });
        // Remove duplicates from options
        const uniqueOptions = Array.from(
          new Map(options.map((option) => [option.value, option])).values()
        );
        // Default "Please select an option" as the first dropdown item
        editor = {
          type: 'list',
          config: {
            list: [
              { value: '', title: 'Please select an option' }, // Default option
              ...uniqueOptions, // Add dynamic options
            ],
          },
        };
        valuePrepareFunction = (cell: any, row: any) => {          
          // Check if cell is an object with a 'selected' property
          if (cell && typeof cell === 'object' && cell.selected) {            
            // Return the 'display' from the 'selected' property
            if (cell.selected && cell.selected.display) {
              return cell.selected.display; // Return the 'display' property
            }
          }
          // If no valid 'display' value is found, fallback to 'N/A'
          return 'N/A';
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
        // File field
        fieldType = 'file';
        editor = {
          type: 'custom', // Use custom editor type
          component: FileUploadEditorComponent, // Specify editor component
        };
          formattedTitle = column
            .replace(/^file_/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        } else if (column.startsWith('date_')) {
          // Date field
          fieldType = 'date';
          editor = {
            type: 'custom', // Use custom editor type
            component: DatepickerComponent, // Use your existing DatepickerComponent here
          };
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
          valuePrepareFunction: valuePrepareFunction,
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
