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
  source: LocalDataSource = new LocalDataSource();
  currentEndpoint: string;

  settings: any = {
    actions: {
      add: false,
      edit: false,
      delete: true,
    },
    columns: {},
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private collectionsService: CollectionsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const handle = params.get('handle');
      const currentPath = this.router.url;

      if (handle) {
        this.currentEndpoint = this.determineEndpoint(currentPath);
        this.fetchCollectionData(handle);
      }
    });
  }

  determineEndpoint(path: string): string {
    const endpointMapping: { [key: string]: string } = {
      '/dashboard': '/api/dashboard',
      '/pages/insurance-companies': '/collections/show',
      '/pages/insurance-types': '/collections/show',
      '/pages/contracts': '/collections/show',
      '/pages/communication': '/collections/show',
      '/pages/files': '/collections/show',
      '/pages/offers': '/collections/show',
    };

    for (const route in endpointMapping) {
      if (path.includes(route)) {
        return endpointMapping[route];  // Return the endpoint without 'handle'
      }
    }

    return '/api/collection';
  }

  fetchCollectionData(handle: string): void {
    const endpointWithHandle = `${this.currentEndpoint}/${handle}`;

    this.collectionsService.getDynamicData(endpointWithHandle).subscribe(
      (response) => {
        // Check if response has data before configuring columns
        if (response && response.columns && Array.isArray(response.columns)) {
          this.configureTableColumns(response);
        } else {
          // Handle empty or malformed response gracefully
          console.error('Invalid or empty columns in response:', response);
          this.settings.columns = {}; // Reset columns if data is invalid
        }
        this.source.load(response.data || []); // Load data if available, else empty array
      },
      (error) => {
        console.error('Error fetching collection data:', error);
      }
    );
  }

  configureTableColumns(response: any): void {
    // Check if data exists and has the expected structure
    const dynamicColumns: any = {};

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      response.columns.forEach((column: string) => {
        dynamicColumns[column] = {
          title: column.charAt(0).toUpperCase() + column.slice(1),
          type: typeof response.data[0][column] === 'number' ? 'number' : 'string',
        };
      });
    } else {
      console.warn('No data available for configuring columns.');
      // Fallback in case there's no data
      dynamicColumns['empty'] = { title: 'No Data Available', type: 'string' };
    }

    this.settings.columns = dynamicColumns; // Update column settings
    this.source.load(response.data || []); // Set data source directly without resetting it
  }

  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }
}
