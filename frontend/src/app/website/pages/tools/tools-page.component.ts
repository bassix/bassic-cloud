import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-tools-page',
  standalone: true,
  imports: [RouterModule, MatIconModule, TranslateModule],
  templateUrl: './tools-page.component.html',
  styleUrls: ['./tools-page.component.scss'],
})
export class ToolsPageComponent {}
