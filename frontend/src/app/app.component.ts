import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public constructor(private readonly translate: TranslateService) {
    const savedLang = localStorage.getItem('basscloud_lang') || 'en';
    this.translate.addLangs(['en', 'de', 'pl', 'fr']);
    this.translate.setDefaultLang('en');
    this.translate.use(savedLang);
  }
}
