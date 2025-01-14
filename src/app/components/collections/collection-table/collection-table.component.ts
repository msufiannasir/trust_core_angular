import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CollectionsService } from '../../../services/collections.service';
import { LocalDataSource } from 'ng2-smart-table';

@Component({
  selector: 'ngx-smart-table',
  templateUrl: './collection-table.component.html',
  styleUrls: ['./collection-table.component.scss'],
})
export class CollectionTableComponent implements OnInit {
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
    columns: {}, // Columns will be populated dynamically
  };

  source: LocalDataSource = new LocalDataSource();
  collectionId: number;

  constructor(
    private route: ActivatedRoute, // Access the route parameters
    private collectionsService: CollectionsService
  ) {}

  ngOnInit(): void {
    // Get the dynamic ID from the route
    this.route.params.subscribe((params) => {
      const id = +params['id']; // Convert `id` to a number
      if (id) {
        this.collectionId = id;
        this.fetchCollection(id); // Fetch the collection based on the `id`
      }
    });
  }

  fetchCollection(id: number): void {
    this.collectionsService.getCollectionById(id).subscribe(
      (response) => {
        console.log('API Response:', response); // Debugging
        this.configureTableColumns(response);

        // Add the dynamic data to the table
        this.source.load([response]); // Assuming the response is an object
      },
      (error) => {
        console.error('Error fetching collection:', error);
      }
    );
  }

  configureTableColumns(response: any): void {
    const dynamicColumns: any = {};

    // Add columns dynamically based on the keys in the response
    for (const key in response) {
      if (Object.prototype.hasOwnProperty.call(response, key)) {
        dynamicColumns[key] = {
          title: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize the column title
          type: typeof response[key] === 'number' ? 'number' : 'string',
        };
      }
    }

    // Add columns for `meta_data` if available
    if (response.meta_data && Array.isArray(response.meta_data)) {
      response.meta_data.forEach((meta: any, index: number) => {
        dynamicColumns[`meta_${index}`] = {
          title: `Meta ${index + 1}`,
          type: typeof meta === 'number' ? 'number' : 'string',
          valuePrepareFunction: () => meta,
        };
      });
    }

    this.settings.columns = dynamicColumns;
    this.settings = { ...this.settings }; // Trigger table refresh
  }

  // onDeleteConfirm method as defined earlier
  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      event.confirm.resolve(); // Proceed with the delete operation
    } else {
      event.confirm.reject(); // Reject the delete operation
    }
  }
}
