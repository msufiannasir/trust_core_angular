import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CollectionsService } from '../../services/collections.service'; // Import your service

@Component({
  selector: 'app-link-render',
  template: `<a (click)="navigate()" style="cursor: pointer; text-decoration: none; color: blue;">
                {{ value }}
             </a>`,
})
export class LinkRenderComponent {
  @Input() value: string = ''; // Collection Name
  @Input() rowData: any; // Entire row data

  constructor(private router: Router, private collectionsService: CollectionsService) {}

  navigate(): void {
    if (!this.rowData || !this.rowData.handle) {
      return; // If no handle, do nothing
    }

    const handle = this.rowData.handle;
    if (handle.startsWith('template_')) {
      // Check if entries exist for this template
      const endpoint = `collections/show/${handle}`;
      this.collectionsService.getDynamicData(endpoint).subscribe(
        (response) => {
          if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
            const firstEntry = response.data[0]; // Get first entry ID
            this.router.navigate([`/pages/${handle}/entry`, firstEntry.id]); // Redirect to edit page
          } else {
            this.router.navigate([`/pages/${handle}/create`]); // Redirect to create page
          }
        },
        (error) => {
          console.error('Error fetching collection data:', error);
          this.router.navigate([`/pages/${handle}/create`]); // Fallback to create
        }
      );
    } else {
      // Default navigation for non-template collections
      this.router.navigate([`/pages/${handle}`]);
    }
  }
}
