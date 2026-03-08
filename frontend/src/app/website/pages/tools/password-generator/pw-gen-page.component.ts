import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { PasswordGeneratorComponent } from '../../../features/tools/password-generator/password-generator.component';

/**
 * Public website page for the password generator at /:lang/tools/password-generator.
 * Embeds the PasswordGeneratorComponent; this page provides only the website layout context.
 */
@Component({
  selector: 'app-pw-gen-page',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatIconModule, TranslateModule, PasswordGeneratorComponent],
  templateUrl: './pw-gen-page.component.html',
  styleUrls: ['./pw-gen-page.component.scss'],
})
export class PwGenPageComponent {}
