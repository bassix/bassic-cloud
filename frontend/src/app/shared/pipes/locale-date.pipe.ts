import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Formats a date using the currently active language as locale.
 * Usage: {{ value | localeDate:'short' }}
 */
@Pipe({
  name: 'localeDate',
  standalone: true,
  pure: false,
})
export class LocaleDatePipe implements PipeTransform {
  private readonly localeMap: Record<string, string> = {
    en: 'en-US',
    de: 'de-DE',
    fr: 'fr-FR',
    pl: 'pl-PL',
  };

  public constructor(private readonly translate: TranslateService) {}

  public transform(value: string | Date | null | undefined, format: 'short' | 'medium' | 'long' | 'full' | 'date' | 'time' = 'short'): string {
    if (!value) {
      return '';
    }

    const date = typeof value === 'string' ? new Date(value) : value;
    const lang = this.translate.currentLang ?? this.translate.defaultLang ?? 'en';
    const locale = this.localeMap[lang] ?? lang;

    const options = this.getOptions(format);

    try {
      return new Intl.DateTimeFormat(locale, options).format(date);
    } catch {
      return new Intl.DateTimeFormat('en-US', options).format(date);
    }
  }

  private getOptions(format: string): Intl.DateTimeFormatOptions {
    switch (format) {
      case 'short':
        return { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      case 'medium':
        return { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      case 'long':
        return { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      case 'full':
        return { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      case 'date':
        return { year: 'numeric', month: '2-digit', day: '2-digit' };
      case 'time':
        return { hour: '2-digit', minute: '2-digit' };
      default:
        return { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    }
  }
}
