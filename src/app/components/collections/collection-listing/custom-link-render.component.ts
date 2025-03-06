import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ViewCell } from 'ng2-smart-table';

@Component({
  selector: 'app-custom-link-render',
  template: `
    <a (click)="navigate()" class="custom-link">{{ value }}</a>
  `,
  styles: [`
    .custom-link {
      color: blue;
      cursor: pointer;
      text-decoration: underline;
    }
  `]
})
export class CustomLinkRenderComponent implements ViewCell {
  @Input() value: string; // Display text
  @Input() rowData: any; // The entire row data

  constructor(private router: Router) {}

  navigate(): void {
    if (this.rowData.link) {
      this.router.navigateByUrl(this.rowData.link);
    }
  }
}
