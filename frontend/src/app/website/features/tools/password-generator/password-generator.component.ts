import { Component, Optional } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-password-generator',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSliderModule,
    MatSnackBarModule,
    MatTooltipModule,
    TranslateModule,
  ],
  templateUrl: './password-generator.component.html',
  styleUrls: ['./password-generator.component.scss'],
})
export class PasswordGeneratorComponent {
  public length: number = 16;
  public includeNumbers: boolean = true;
  public includeLowercase: boolean = true;
  public includeUppercase: boolean = true;
  public includeSpecial: boolean = false;
  public excludeAmbiguous: boolean = true;
  public generatedPassword: string = '';

  private readonly ambiguous: string = 'lIO017';
  private readonly special: string = '#&@$_%?+';

  public constructor(
    @Optional() private readonly dialogRef: MatDialogRef<PasswordGeneratorComponent> | null,
    private readonly snackBar: MatSnackBar,
    private readonly translate: TranslateService,
  ) {
    this.generate();
  }

  public generate(): void {
    const chars = this.buildCharset();

    if (chars.length === 0) {
      this.generatedPassword = '';

      return;
    }

    let result = '';
    const array = new Uint32Array(this.length * 2);

    crypto.getRandomValues(array);

    for (let i = 0; i < array.length && result.length < this.length; i++) {
      result += chars[array[i] % chars.length];
    }

    // Ensure at least one char from each required group
    if (!this.meetsRequirements(result, chars)) {
      this.generate();

      return;
    }

    this.generatedPassword = result.slice(0, this.length);
  }

  public copyToClipboard(): void {
    if (!this.generatedPassword) {
      return;
    }

    navigator.clipboard.writeText(this.generatedPassword).then(() => {
      this.snackBar.open(
        this.translate.instant('tools.copied'),
        '',
        { duration: 2000, panelClass: 'success-snack' },
      );
    }).catch(() => {
      // fallback for older browsers
      const el = document.createElement('textarea');

      el.value = this.generatedPassword;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      this.snackBar.open(this.translate.instant('tools.copied'), '', { duration: 2000 });
    });
  }

  public close(): void {
    this.dialogRef?.close();
  }

  private buildCharset(): string[] {
    const digits = '0123456789';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let pool = '';

    if (this.includeNumbers) { pool += digits; }

    if (this.includeLowercase) { pool += lower; }

    if (this.includeUppercase) { pool += upper; }

    if (this.includeSpecial) { pool += this.special; }

    if (this.excludeAmbiguous) {
      pool = pool.split('').filter((c) => !this.ambiguous.includes(c)).join('');
    }

    return pool.split('');
  }

  private meetsRequirements(pwd: string, _chars: string[]): boolean {
    if (this.includeNumbers && !/[0-9]/.test(pwd)) { return false; }

    if (this.includeLowercase && !/[a-z]/.test(pwd)) { return false; }

    if (this.includeUppercase && !/[A-Z]/.test(pwd)) { return false; }

    if (this.includeSpecial && !new RegExp(`[${this.special.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(pwd)) { return false; }

    return true;
  }
}
