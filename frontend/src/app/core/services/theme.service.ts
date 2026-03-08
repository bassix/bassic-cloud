import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

const THEME_KEY = 'basscloud_theme';

export type ThemeMode = 'light' | 'dark';

/**
 * Manages dark/light mode toggle.
 * Persists preference to localStorage and applies `dark` class to <html>.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly renderer: Renderer2;
  private readonly mode$ = new BehaviorSubject<ThemeMode>(this.loadStoredTheme());

  public constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.applyTheme(this.mode$.value);
  }

  public get theme$(): Observable<ThemeMode> {
    return this.mode$.asObservable();
  }

  public get currentMode(): ThemeMode {
    return this.mode$.value;
  }

  public get isDark(): boolean {
    return this.mode$.value === 'dark';
  }

  public toggle(): void {
    const next: ThemeMode = this.mode$.value === 'light' ? 'dark' : 'light';

    this.setTheme(next);
  }

  public setTheme(mode: ThemeMode): void {
    this.mode$.next(mode);
    localStorage.setItem(THEME_KEY, mode);
    this.applyTheme(mode);
  }

  private loadStoredTheme(): ThemeMode {
    const stored = localStorage.getItem(THEME_KEY) as ThemeMode | null;

    if (stored) {
      return stored;
    }

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  private applyTheme(mode: ThemeMode): void {
    const html = document.documentElement;

    if (mode === 'dark') {
      this.renderer.addClass(html, 'dark');
    } else {
      this.renderer.removeClass(html, 'dark');
    }
  }
}
