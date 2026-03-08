import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [MatIconModule, TranslateModule],
  templateUrl: './legal-page.component.html',
  styleUrls: ['./legal-page.component.scss'],
})
export class LegalPageComponent {
  public type: string;

  public constructor(private readonly route: ActivatedRoute) {
    this.type = (this.route.snapshot.data['type'] as string | undefined) ?? 'imprint';
  }
}
