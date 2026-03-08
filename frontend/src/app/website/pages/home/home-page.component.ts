import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatIconModule, TranslateModule],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  public lang = 'en';

  public constructor(private readonly route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.lang = this.route.parent?.snapshot.paramMap.get('lang') ?? 'en';
  }
}
