import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

/** Redirects the root path to the user's preferred language segment (e.g. /de, /en). */
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
  ) {}

  public ngOnInit(): void {
    const stored = localStorage.getItem('basscloud_lang') ?? '';
    const browser = navigator.language.slice(0, 2).toLowerCase();
    const preferred = [stored, browser, this.translate.currentLang]
      .find(l => LangRedirectComponent.supportedLangs.includes(l as 'de' | 'en' | 'pl' | 'fr'));
    const lang = preferred ?? 'en';

    void this.router.navigate(['/', lang], { replaceUrl: true });
  }
}
