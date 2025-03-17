import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { SiteSettingsService } from '../../services/site-settings.service';
import { UsersService } from '../../services/users.service';
import { environment } from '../../../environments/environment';
import { NbThemeService } from '@nebular/theme';
import { NbThemeModule, NbLayoutModule, NbSelectModule, NbCardModule } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
declare const google: any; // Declare google globally

@Component({
  selector: 'ngx-smart-table',
  templateUrl: './usersettings.component.html',
  styleUrls: ['./usersettings.component.scss']
})

export class UsersettingsComponent implements OnInit {
  source: LocalDataSource = new LocalDataSource();
  currentLanguage: string = 'en';
  currentuser=localStorage.getItem('user');
  userId: any= ''; // Store user ID from API
   google: any; 
  themes = [
    { value: 'default', name: 'Light' },
    { value: 'dark', name: 'Dark' },
    { value: 'cosmic', name: 'Cosmic' },
    { value: 'corporate', name: 'Corporate' },
  ];

  currentTheme = this.getStoredTheme() || 'default';
  settingsForm!: FormGroup;
  settingsData: any = {};
  uploadedFiles: { [key: string]: File } = {}; // Store selected files

  addingField = false;  // Controls add field visibility
  deletingField = false; // Controls delete field visibility
  newFieldName: string = '';  // Stores new field name
  fieldToDelete: string = ''; // Stores field to delete

  constructor(private fb: FormBuilder, private UsersService: UsersService, private themeService: NbThemeService,private translate: TranslateService) {}
  ngOnInit(): void {
    this.translate.use(this.currentLanguage);
    this.loadGoogleTranslate();
    this.fetchUserSettings();
        // Get the current theme from the service
    this.currentTheme = this.themeService.currentTheme;
    // Listen for theme changes
    this.themeService.onThemeChange()
      .subscribe(theme => {
        this.currentTheme = theme.name;
      });
  }

  loadGoogleTranslate() {
    if (!document.getElementById('google_translate_script')) {
      const script = document.createElement('script');
      script.id = 'google_translate_script';
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      setTimeout(() => {
        if (typeof (window as any).googleTranslateElementInit === 'function') {
          (window as any).googleTranslateElementInit();
        }
      }, 500);
    }

    // (window as any).googleTranslateElementInit = this.googleTranslateElementInit.bind(this);
  }

  googleTranslateElementInit() {
    if (typeof google !== 'undefined' && google.translate) {
      new google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,de,fr,es,it,zh,hi', // Add English 'en' explicitly
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        },
        'google_translate_element'
      );

      // Add English manually in dropdown after initialization
      setTimeout(() => {
        const langSelect = document.querySelector(".goog-te-combo") as HTMLSelectElement;
        if (langSelect) {
          const enOption = document.createElement("option");
          enOption.value = "en";
          enOption.text = "English";
          langSelect.insertBefore(enOption, langSelect.firstChild);
        }
      }, 500);

      //  Prevent Redirection to #googtrans
      setTimeout(() => {
        const langSelect = document.querySelector(".goog-te-combo") as HTMLSelectElement;
        if (langSelect) {
          langSelect.addEventListener("change", function () {
            setTimeout(() => {
              history.pushState({}, "", window.location.href.split("#")[0]); // Remove # from URL
            }, 100);
          });
        }
      }, 1000);
    } else {
      console.error("Google Translate script not loaded.");
    }
  }
  
  
  getStoredTheme(): string | null {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.meta && parsedUser.meta.settings) {
        const settings = JSON.parse(parsedUser.meta.settings);
        return settings.theme_setting || null;
      }
    }
    return null;
  }
  changeTheme(themeName: string): void {
    this.themeService.changeTheme(themeName);
    this.currentTheme = themeName; 
    // Prepare updated settings
    const updatedSettings = { meta_settings: JSON.stringify({ theme_setting: themeName }) }; 
    // Ensure we have a valid user ID before making the request
    if (this.userId) {
      this.UsersService.updateUserProfile(updatedSettings).subscribe(
        (response) => {
          console.log('Theme updated successfully:', response);
                  // Update localStorage with the new theme
        const user = localStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          if (!parsedUser.meta) parsedUser.meta = {};
          parsedUser.meta.settings = JSON.stringify({ theme_setting: themeName });
          localStorage.setItem('user', JSON.stringify(parsedUser)); // Save updated settings in localStorage
        }
        },
        (error) => {
          console.error('Error updating theme:', error);
        }
      );
    } else {
      console.error('User ID is missing. Unable to update theme.');
    }
  }
  fetchUserSettings(): void {
    this.UsersService.getUserSettings().subscribe(
      (response) => {
        if (response.data && response.data.length > 0) {
          const user = response.data[0];
          this.userId = user.id;          
          // Extract theme setting from JSON field
          const settings = user.meta_settings ? JSON.parse(user.meta_settings) : {};
          if (settings.theme_setting) {
            this.currentTheme = settings.theme_setting;
            this.themeService.changeTheme(this.currentTheme); // Apply the theme
          }
        }
      },
      (error) => {
        console.error('Error fetching user settings:', error);
      }
    );
  }
  // changeLanguage(language: string): void {
  //   this.currentLanguage = language;
  //   this.translate.use(language); // Change language dynamically
  // }
  // changeLanguage(lang: string): void {
  //   this.currentLanguage = lang;
  //   this.translate.use(lang); // Change language dynamically
  //   // Manually trigger Google Translate without reloading
  //   const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
  //   if (selectElement) {
  //     selectElement.value = lang;
  //     selectElement.dispatchEvent(new Event('change'));
  //   }
  // }
  
  
  // changeLanguage(lang: string) {
  //   Object.keys(this.content).forEach(key => {
  //     this.translationService.translateText(this.content[key], lang).subscribe((response: any) => {
  //       if (response.data && response.data.translations.length > 0) {
  //         this.translatedContent[key] = response.data.translations[0].translatedText;
  //       }
  //     });
  //   });
  // }


}

