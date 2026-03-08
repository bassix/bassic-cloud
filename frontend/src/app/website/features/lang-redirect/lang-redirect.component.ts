import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '@env/environment';

/**
 * Root route handler: checks setup status first, then redirects to
 * the user's preferred language segment (e.g. /de, /en).
 */
@Component({
  selector: 'app-lang-redirect',
  standalone: true,
  template: '',
})
export class LangRedirectComponent implements OnInit {
  private static readonly supportedLangs = ['de', 'en', 'pl', 'fr'] as const;

  public constructor(
    private readonly router: Router,
    private readonly translate: TranslateService,
    private readonly http: HttpClient,
  ) {}

  public ngOnInit(): void {
    // Check setup status first — redirect to /setup if not complete
    this.http.get<{ success: boolean; data: { setupComplete: boolean } }>(
      `${environment.apiUrl}/setup/status`,
    ).subscribe({
      next: (res) => {
        if (!res.data.setupComplete) {
          void this.router.navigate(['/setup'], { replaceUrl: true });

          return;
        }

        this.redirectToLang();
      },
      error: () => {
        // API not available (no DB) → go to setup
        void this.router.navigate(['/setup'], { replaceUrl: true });
      },
    });
  }

  private redirectToLang(): void {
    const stored = localStorage.getItem('basscloud_lang') ?? '';
    const browser = navigator.language.slice(0, 2).toLowerCase();
    const preferred = [stored, browser, this.translate.currentLang]
      .find(l => LangRedirectComponent.supportedLangs.includes(l as 'de' | 'en' | 'pl' | 'fr'));
    const lang = preferred ?? 'en';

    void this.router.navigate(['/', lang], { replaceUrl: true });
  }
}
