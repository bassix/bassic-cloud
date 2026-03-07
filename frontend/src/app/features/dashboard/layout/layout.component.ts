import { Component } from '@angular/core';

import { RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { User } from '@core/models/api.models';

@Component({
    selector: 'app-layout',
    imports: [
    RouterModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    TranslateModule,
    MatSlideToggleModule
],
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  public sidebarOpen = true;

  public constructor(
    private authService: AuthService,
    private translate: TranslateService,
    public themeService: ThemeService,
  ) {}

  public get currentUser(): User | null {
    return this.authService.currentUser;
  }

  public get isAdmin(): boolean {
    return this.currentUser?.roles.includes('ROLE_ADMIN') ?? false;
  }

  public switchLang(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('basscloud_lang', lang);
  }

  public onLogout(): void {
    this.authService.logout();
  }
}
