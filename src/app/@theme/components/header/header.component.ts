import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { UsersService } from '../../../services/users.service';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;
  currentuser=localStorage.getItem('user');

  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    },
    {
      value: 'cosmic',
      name: 'Cosmic',
    },
    {
      value: 'corporate',
      name: 'Corporate',
    },
  ];

  currentTheme = this.getStoredTheme() || 'default';

  userMenu = [ { title: 'Profile' }, { title: 'Log out' } ];

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private themeService: NbThemeService,
              private userService: UserData,
              private layoutService: LayoutService,
              private usersService: UsersService,
              private breakpointService: NbMediaBreakpointsService, 
              private router: Router) {
  }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;
    var currentuser=JSON.parse(this.currentuser);
    this.userService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe((users: any) => {this.user = users.nick});
    this.user=currentuser;
    this.user.name=currentuser.name+' '+ currentuser.meta.text_last_name;
    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);
       // Listen for menu item clicks
        this.menuService.onItemClick()
        .pipe(takeUntil(this.destroy$))
        .subscribe(({ item }) => {
          if (item.title === 'Log out') {
            this.usersService.logout(); // Call the logout method
          }
          if (item.title === 'Profile') {
            this.router.navigate(['pages/user/profile']);
          }
        });
  }
  getStoredTheme(): string | null {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.meta && parsedUser.meta.settings) {
        const settings = JSON.parse(parsedUser.meta.settings);
        console.log(settings.theme_setting );
        return settings.theme_setting || null;
      }
    }
    return null;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // changeTheme(themeName: string) {
  //   this.themeService.changeTheme(themeName);
  // }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }
}
