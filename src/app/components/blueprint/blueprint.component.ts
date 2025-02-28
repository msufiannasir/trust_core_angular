import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlueprintService } from '../../services/blueprint.service';
import { LocalDataSource } from 'ng2-smart-table';
import { ChangeDetectorRef } from '@angular/core';
import { Location } from '@angular/common'; 

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
      confirmDelete: true,
    },
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
              { value: 'text', title: 'Text' },
              { value: 'file', title: 'File' },
              { value: 'date', title: 'Date' },
              { value: 'textarea', title: 'Textarea' },
              { value: 'relational', title: 'Relational' },
            ],
          },
        },
      },
      linkType: {
        title: 'Relational Field',
        type: 'string',
        valuePrepareFunction: (cell, row) => {
          return row.linkTypeText ? row.linkTypeText : 'N/A'; 
        },
        editor: {
          type: 'list',
          config: {
            list: [], // Dynamically set in `setLinkTypeOptions`
          },
        },
        // addable: false,
        // editable: false, // Initial state
      },
      isRequired: {
        title: 'Required',
        type: 'boolean',
        editor: {
          type: 'checkbox',
        },
      },

    },
    pager: {
      perPage: 10,
    },
  };

  constructor(
    private route: ActivatedRoute,
    private BlueprintService: BlueprintService,
    private cdr: ChangeDetectorRef,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const handle = params.get('handle');
      console.log(handle);
      if (handle) {
        this.collectionHandle = handle;  // Save it to collectionHandle
        this.fetchCollectionFields(handle);
      }
    });
  }

  fetchCollectionFields(handle: string): void {
    this.BlueprintService.getCollectionFields(handle).subscribe(
      (response) => {
        console.log("API Response:", response);
        const fields = response.fields ? Object.keys(response.fields) : [];
        this.allCollections = response.allCollections || [];

        const hiddenFields = ['id', 'collection_id', 'created_at', 'updated_at'];
        const filteredFields = fields.filter((field: string) => !hiddenFields.includes(field));

        console.log("filteredFields " + filteredFields);

        const allOptions = [
          { value: 'user', title: 'User' },
          { value: 'templates_collection', title: 'Templates Collection' },
          ...this.allCollections.map((collection) => ({
            value: collection.id,
            title: collection.name,
          })),
        ];

        const tableData = filteredFields.map((field: string) => {
          const formattedFieldName = this.formatFieldName(field); // Declare the variable here
          const extractedLinkType = this.getLinkType(field);
          let selectedValue = null;
          let selectedText = null;
  
          // 1️ Handle static options (users & collections)
          if (extractedLinkType.toLowerCase() === 'users') {
            selectedValue = 'user';
            selectedText = 'User';
          } else if (extractedLinkType.toLowerCase() === 'collections') {
            selectedValue = 'templates_collection';
            selectedText = 'Templates Collection';
          } else {
            // 2️ Match extracted text with the options text dynamically
            const matchedOption = allOptions.find(
              (option) => option.title.toLowerCase() === extractedLinkType.toLowerCase()
            );
  
            if (matchedOption) {
              selectedValue = matchedOption.value;
              selectedText = matchedOption.title; // Ensure we store the display name
            }
          }
  
          return {
            fieldName: formattedFieldName,
            fieldType: this.getFieldType(field),
            linkType: selectedValue, // Selected value (for saving)
            linkTypeText: selectedText, // Displayed text in the table
            old_field_name: field,
            isRequired: field.includes('_req')
          };
        });
        console.log("Processed Table Data:", tableData); // Debugging
        this.source.load(tableData);
        this.setLinkTypeOptions();
        this.cdr.detectChanges();
      },
      (error) => console.error('Error fetching fields:', error)
    );
  }

  setLinkTypeOptions(): void {
    const staticOptions = [
      { value: 'user', title: 'User' },
      { value: 'templates_collection' , title: 'Templates Collection' },
    ];
    const dynamicOptions = this.allCollections.map((collection) => ({
      value: collection.id,
      title: collection.name,
    }));
  
    this.settings = {
      ...this.settings,
      columns: {
        ...this.settings.columns,
        linkType: {
          ...this.settings.columns.linkType,
          editor: {
            type: 'list',
            config: {
              list: [...staticOptions, ...dynamicOptions],
            },
          },
        },
      },
    };
  
    console.log('Updated Settings:', this.settings);
  }

  onFieldTypeChange(event: any): void {
    const updatedField = event.newData; // Use `newData` to access the updated field values
    const newFieldType = event.newData.fieldType;
    if (newFieldType === 'Relational') {
      // this.settings.columns.linkType.editable = true;
      this.setLinkTypeOptions(); // Update `linkType` options dynamically
    } else {
      // this.settings.columns.linkType.editable = false;
    }

    this.updateField(updatedField);
  }

  // Create operation
  onCreateField(event: any): void {
    const handle = this.collectionHandle || '';
    const fieldData = event.newData;
     // Append _req if isRequired is true
     let fieldName = fieldData.isRequired ? `${fieldData.fieldName}_req` : fieldData.fieldName;
    const payload = {
      field_name: fieldName,
      field_type: fieldData.fieldType,
      status: 'active',
      is_required: fieldData.isRequired || false,
    };
  
    // Handle relational fields
    if (fieldData.fieldType === 'relational') {
      if (fieldData.linkType === 'user') {
        payload['link_type'] = 'user';
      } else if (fieldData.linkType  === 'templates_collection' ){
        payload['link_type'] = 'templates_collection';
      } else {
        payload['link_type'] = 'collection';
        payload['collection_id'] = fieldData.linkType; // Collection ID
      }
    }
  
    this.BlueprintService.createField(handle, payload).subscribe(
      (response) => {
        console.log('Field created successfully:', response);
        this.fetchCollectionFields(handle);
        event.confirm.resolve(); // Resolve creation
      },
      (error) => {
        console.error('Error creating field:', error);
        event.confirm.reject(); // Reject creation
      }
    );
  }
  

  // Update operation
  updateField(updatedField: any): void {
    const handle = this.collectionHandle || '';
    // Append _req if isRequired is true
    let newFieldName = updatedField.isRequired ? `${updatedField.fieldName}_req` : updatedField.fieldName;
    const payload: any = {
      old_field_name: updatedField.old_field_name,
      new_field_name: newFieldName,
      field_type: updatedField.fieldType,
      is_required: updatedField.isRequired || false,
      // status: 'active', // Adjust if needed
    };
  
    // Handle relational fields
    if (updatedField.fieldType === 'relational') {
      if (updatedField.linkType === 'user') {
        payload['link_type'] = 'user';
      } else if (updatedField.linkType === 'templates_collection' ){
        payload['link_type'] = 'templates_collection';
      }
       else {
        payload['link_type'] = 'collection';
        payload['collection_id'] = updatedField.linkType; // Collection ID
      }
    }
  
    this.BlueprintService.updateField(handle, payload).subscribe(
      (response) => {
        console.log('Field updated successfully:', response);
        this.fetchCollectionFields(handle);
      },
      (error) => console.error('Error updating field:', error)
    );
  }
  

  onDeleteField(event: any): void {
    const handle = this.collectionHandle;
    const fieldName = event.data.old_field_name;
  
    if (!handle || !fieldName) {
      console.error('Handle or fieldName is missing.');
      return;
    }
  
    const payload: any = {
      field_name: fieldName,
    };
  
    this.BlueprintService.deleteField(handle, payload).subscribe(
      (response) => {
        console.log('Field deleted successfully:', response);
        this.fetchCollectionFields(handle);
        event.confirm.resolve(); // Resolve deletion
      },
      (error) => {
        console.error('Error deleting field:', error);
        event.confirm.reject(); // Reject deletion
      }
    );
  }
  
  
  // Function to format the field name
// Function to format the field name
// Function to format the field name
formatFieldName(fieldName: string): string {
  // Define the prefixes to remove
  const prefixes = ['rel_', 'col_', 'text_', 'file_', 'date_', 'textarea_'];

  // Remove any specified prefixes
  for (const prefix of prefixes) {
    if (fieldName.startsWith(prefix)) {
      fieldName = fieldName.substring(prefix.length); // Remove the prefix
    }
  }

  // Remove everything after 'col_' (including 'col_')
  const colIndex = fieldName.indexOf('col_');
  if (colIndex !== -1) {
    fieldName = fieldName.substring(0, colIndex); // Keep only the part before 'col_'
  }

  // Remove all occurrences of '_req' in the field name
  fieldName = fieldName.replace(/_req/g, '');
  // Split by underscores and filter out empty strings
  const parts = fieldName.split('_').filter(part => part.length > 0);

  // Capitalize the first letter of each part and join them with a space
  const formattedName = parts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  return formattedName;
}

  getFieldType(fieldName: string): string {
    if (fieldName.startsWith('rel_')) return 'relational';
    if (fieldName.startsWith('text_')) return 'text';
    if (fieldName.startsWith('file_')) return 'file';
    if (fieldName.startsWith('date_')) return 'date';
    if (fieldName.startsWith('textarea_')) return 'textarea';
    return 'Unknown';
  }

  getLinkType(fieldName: string): string {
    if (fieldName.startsWith('rel_')) {
      console.log("fieldName", fieldName); 
      // Extract the part after `_col_`
      const match = fieldName.match(/_col_(.+)/);
      if (match && match[1]) {
        // Replace underscores with spaces and capitalize each word
        return match[1]
          .replace(/_/g, ' ') // Replace underscores with spaces
          .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
      }
    }
    return 'N/A'; // Return 'N/A' if not a relational field
  }  
  goBack(): void {
    this.location.back();  // Navigate to the previous page
  }
}
