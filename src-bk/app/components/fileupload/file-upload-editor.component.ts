// src/app/components/fileupload/file-upload-editor.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-file-upload-editor',
  template: `
    <input type="file" (change)="onFileChange($event)" />
  `,
})
export class FileUploadEditorComponent {
  @Input() value: any; // The initial value (if any)
  @Output() valueChange = new EventEmitter<any>(); // Emits the new value (file)

  constructor() {}

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.valueChange.emit(file); // Emit the file when it's selected
    }
  }
}
