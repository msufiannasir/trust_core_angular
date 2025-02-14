/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { SeoService } from './@core/utils/seo.service';
import { NbThemeService } from '@nebular/theme';

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {

  constructor(private analytics: AnalyticsService, private seoService: SeoService,private themeService: NbThemeService) {
  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
    this.seoService.trackCanonicalChanges();
    this.applyStoredTheme(); // Apply theme on app load
  }
  // Function to fetch and apply stored theme
  applyStoredTheme(): void {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser.meta && parsedUser.meta.settings) {
          const settings = JSON.parse(parsedUser.meta.settings);
          const storedTheme = settings.theme_setting || 'default';

          this.themeService.changeTheme(storedTheme); // Apply the theme
        }
      } catch (error) {
        console.error('Error parsing user settings:', error);
      }
    }
  }
}
