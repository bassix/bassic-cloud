import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';

/** First-run setup page at /setup — creates the first admin user. */
@Component({
  selector: 'app-setup-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    TranslateModule,
  ],
  templateUrl: './setup-page.component.html',
  styleUrls: ['./setup-page.component.scss'],
})
export class SetupPageComponent {
  public form: FormGroup;
  public loading = false;
  public hidePassword = true;
  public errorMessage = '';

  public constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly translate: TranslateService,
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      locale: ['en'],
    });

    // Sync UI language when locale selection changes
    this.form.get('locale')?.valueChanges.subscribe((locale: string) => {
      this.translate.use(locale);
      localStorage.setItem('basscloud_lang', locale);
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formVal = this.form.value as {
      username: string;
      email: string;
      password: string;
      locale: string;
    };

    this.authService.setup(formVal).subscribe({
      next: (response) => {
        this.loading = false;

        if (response.success) {
          this.snackBar.open(
            this.translate.instant('setup.success') as string,
            this.translate.instant('common.close') as string,
            { duration: 3000 },
          );
          void this.router.navigate(['/', formVal.locale, 'login']);
        }
      },
      error: (err: { error?: { message?: string } }) => {
        this.loading = false;
        this.errorMessage = err.error?.message ?? (this.translate.instant('common.error') as string);
      },
    });
  }
}
