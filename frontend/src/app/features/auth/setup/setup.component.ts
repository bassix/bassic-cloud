import { Component } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';

@Component({
    selector: 'app-setup',
    imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    TranslateModule
],
    templateUrl: './setup.component.html',
    styleUrls: ['./setup.component.scss']
})
export class SetupComponent {
  public form: FormGroup;
  public loading = false;
  public hidePassword = true;
  public errorMessage = '';

  public constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      locale: ['en'],
    });

    // Update UI language when locale selection changes
    this.form.get('locale')?.valueChanges.subscribe((locale: string) => {
      this.translate.use(locale);
      localStorage.setItem('basscloud_lang', locale);
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.setup(this.form.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open(
            this.translate.instant('setup.success'),
            this.translate.instant('common.close'),
            { duration: 3000 },
          );
          this.router.navigate(['/login']);
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || this.translate.instant('common.error');
        this.loading = false;
      },
    });
  }
}
