import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';

/** Supported language codes for the public website. */
const SUPPORTED_LANGS = ['de', 'en', 'pl', 'fr'] as const;

type SupportedLang = typeof SUPPORTED_LANGS[number];

@Component({
  selector: 'app-website-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    TranslateModule,
  ],
  templateUrl: './website-layout.component.html',
  styleUrls: ['./website-layout.component.scss'],
})
export class WebsiteLayoutComponent implements OnInit {
  public scrolled = false;

  public constructor(
    public readonly themeService: ThemeService,
    public readonly authService: AuthService,
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    // Sync translate service when the :lang route param changes
    this.route.paramMap.subscribe(params => {
      const lang = params.get('lang');

      if (lang && SUPPORTED_LANGS.includes(lang as SupportedLang)) {
        this.translate.use(lang);
        localStorage.setItem('basscloud_lang', lang);
      }
    });
  }

  public get isLoggedIn(): boolean {
    return this.authService.isAuthenticated;
  }

  public get isAdmin(): boolean {
    return this.authService.currentUser?.roles.includes('ROLE_ADMIN') ?? false;
  }

  public get currentLang(): string {
    return this.translate.currentLang ?? 'en';
  }

  public get currentYear(): number {
    return new Date().getFullYear();
  }

  /** Switch language and update the URL to reflect the new language segment. */
  public switchLang(lang: SupportedLang): void {
    this.translate.use(lang);
    localStorage.setItem('basscloud_lang', lang);

    // Navigate to the same path under the new language prefix
    const segments = this.router.url.split('/').filter(Boolean);

    if (segments.length > 0 && SUPPORTED_LANGS.includes(segments[0] as SupportedLang)) {
      segments[0] = lang;
    } else {
      segments.unshift(lang);
    }

    void this.router.navigate(['/', ...segments], { replaceUrl: true });
  }

  public logout(): void {
    this.authService.logout();
    void this.router.navigate(['/']);
  }

  @HostListener('window:scroll')
  public onScroll(): void {
    this.scrolled = window.scrollY > 20;
  }
}
