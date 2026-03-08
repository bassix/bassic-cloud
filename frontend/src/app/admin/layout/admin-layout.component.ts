import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { User } from '@core/models/api.models';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterModule, RouterOutlet,
    MatButtonModule, MatIconModule, MatMenuModule,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatTooltipModule, TranslateModule,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent {
  public sidebarOpen = true;

  public constructor(
    private readonly authService: AuthService,
    private readonly translate: TranslateService,
    private readonly router: Router,
    public readonly themeService: ThemeService,
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

  public logout(): void {
    this.authService.logout();
    void this.router.navigate(['/']);
  }
}
