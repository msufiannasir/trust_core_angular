import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlueprintService } from '../../services/blueprint.service';
import { LocalDataSource } from 'ng2-smart-table';
import { DatepickerComponent } from '../../pages/forms/datepicker/datepicker.component';
import { FileUploadEditorComponent } from '../fileupload/file-upload-editor.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-blueprint',
  templateUrl: './blueprint.component.html',
  styleUrls: ['./blueprint.component.scss'],
})
export class BlueprintComponent implements OnInit {
  source: LocalDataSource = new LocalDataSource();
  currentEndpoint: string;
  collectionHandle: string | null = null;
  allCollections: any[] = []; // Store all collections
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
      confirmCreate: true,
    },
    tableTitle: '',
    columns: {
      fieldName: {
        title: 'Field Name',
        type: 'string',
      },
      fieldType: {
        title: 'Field Type',
        type: 'string',
        editor: {
          type: 'list',
          config: {
            list: [
              { value: 'Text', title: 'Text' },
              { value: 'File', title: 'File' },
              { value: 'Date', title: 'Date' },
              { value: 'Textarea', title: 'Textarea' },
              { value: 'Relational', title: 'Relational' },
            ],
          },
        },
      },
      linkType: {
        title: 'Relational Field',
        type: 'string',
        editor: {
          type: 'list',
          config: {
            list: [], // This will be updated dynamically
          },
        },
        editable: false, // Initially disabled
      },
    },
    pager: {
      perPage: 10,
    },
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private BlueprintService: BlueprintService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef

  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const handle = params.get('handle');
      if (handle) {
        this.fetchCollectionFields(handle);
      }
    });
  
    // Set the initial state of the linkType field
    this.settings.columns.linkType.editable = false; // Initially disabled
  }

  fetchCollectionFields(handle: string): void {
    this.BlueprintService.getCollectionFields(handle).subscribe(
      (response) => {
        console.log('API Response:', response);
        const fields = response.fields || [];
        const collectionStatus = response.collection.status;
  
        // Store all collections
        this.allCollections = response.allCollections || [];
        console.log('All Collections:', this.allCollections);
  
        const hiddenFields = ['id', 'collection_id', 'created_at', 'updated_at'];
        const filteredFields = fields.filter((field: string) => !hiddenFields.includes(field));
  
        const tableData = filteredFields.map((field: string) => {
          return {
            fieldName: field,
            fieldType: this.getFieldType(field),
            linkType: this.getLinkType(field),
            status: collectionStatus,
          };
        });
  
        this.source.load(tableData);
  
        // Set the linkType options directly in the settings
        this.setLinkTypeOptions();
  
        // Force change detection
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching fields:', error);
      }
    );
  }

  setLinkTypeOptions(): void {
    const staticOptions = [
      { value: 'User  ', title: 'User  ' },
      { value: 'Columns', title: 'Columns' },
    ];
  
    // Map allCollections to the desired format
    const dynamicOptions = this.allCollections.map(collection => ({
      value: collection.id, // Use the collection ID as the value
      title: collection.name, // Use the collection name as the title
    }));
  
    // Combine static and dynamic options
    this.settings.columns.linkType.editor = {
      type: 'list',
      config: {
        list: [...staticOptions, ...dynamicOptions],
      },
    };
  
    console.log('Link Type Options:', this.settings.columns.linkType.editor.config.list); // Log the options
  }
  getFieldType(fieldName: string): string {
    if (fieldName.startsWith('rel_')) {
      return 'Relation';
    } else if (fieldName.startsWith('text_')) {
      return 'Text';
    } else if (fieldName.startsWith('file_')) {
      return 'File';
    } else if (fieldName.startsWith('date_')) {
      return 'Date';
    } else if (fieldName.startsWith('textarea_')) {
      return 'TextArea';
    }
    return 'Unknown';
  }

  getLinkType(fieldName: string): string {
    if (fieldName.startsWith('rel_')) {
      return 'Link';
    }
    return 'None';
  }

  onFieldTypeChange(event: any, row: any): void {
    const selectedFieldType = event.newValue;
  
    // Check if the selected field type is 'Relational'
    if (selectedFieldType === 'Relational') {
      this.settings.columns.linkType.editable = true; // Enable linkType
    } else {
      this.settings.columns.linkType.editable = false; // Disable linkType
    }
  
    // Update the row in the source with the new editable state
    this.source.update(row, { linkType: selectedFieldType === 'Relational' ? '' : 'None' })
      .then(() => {
        // Optionally handle success
      })
      .catch((error) => {
        console.error('Error updating row:', error);
      });
  }
  // Create a new field
  onCreateField(handle: string, fieldData: any): void {
    this.BlueprintService.createField(handle, fieldData).subscribe(
      (response) => {
        console.log('Field created successfully:', response);
        this.fetchCollectionFields(handle);
      },
      (error) => {
        console.error('Error creating field:', error);
      }
    );
  }

  // Delete a field
  onDeleteField(handle: string, fieldName: string): void {
    this.BlueprintService.deleteField(handle, fieldName).subscribe(
      (response) => {
        console.log('Field deleted successfully:', response);
        this.fetchCollectionFields(handle);
      },
      (error) => {
        console.error('Error deleting field:', error);
      }
    );
  }

  // Update a field
  updateField(handle: string, fieldData: any): void {
    this.BlueprintService.updateField(handle, fieldData).subscribe(
      (response) => {
        console.log('Field updated successfully:', response);
        this.fetchCollectionFields(handle);
      },
      (error) => {
        console.error('Error updating field:', error);
      }
    );
  }
}