import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';

@Component({
    selector: 'app-login',
    imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    TranslateModule
],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public form: FormGroup;
  public loading = false;
  public hidePassword = true;
  public errorMessage = '';
  public lockedSeconds = 0;

  private lockTimer: ReturnType<typeof setInterval> | null = null;

  public constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly translate: TranslateService,
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    // If already authenticated, redirect appropriately
    if (this.authService.isAuthenticated) {
      const target = this.authService.currentUser?.roles.includes('ROLE_ADMIN') ? '/admin' : '/';

      void this.router.navigate([target]);
    }
  }

  public onSubmit(): void {
    if (this.form.invalid || this.loading || this.lockedSeconds > 0) return;

    this.loading = true;
    this.errorMessage = '';
    const { username, password } = this.form.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.loading = false;

        if (response.success) {
          const isAdmin = this.authService.currentUser?.roles.includes('ROLE_ADMIN') ?? false;

          void this.router.navigate([isAdmin ? '/admin' : '/']);
        }
      },
      error: (err) => {
        this.loading = false;
        const body = err.error;

        this.errorMessage = body?.message || this.translate.instant('auth.invalid');

        // Handle lockout timer from Fibonacci-based delay
        const retryAfter = body?.errors?.retryAfter;

        if (retryAfter && retryAfter > 0) {
          this.startLockTimer(retryAfter);
        }
      },
    });
  }

  private startLockTimer(seconds: number): void {
    this.clearLockTimer();
    this.lockedSeconds = seconds;

    this.lockTimer = setInterval(() => {
      this.lockedSeconds--;

      if (this.lockedSeconds <= 0) {
        this.clearLockTimer();
        this.errorMessage = '';
      }
    }, 1000);
  }

  private clearLockTimer(): void {
    if (this.lockTimer) {
      clearInterval(this.lockTimer);
      this.lockTimer = null;
    }

    this.lockedSeconds = 0;
  }
}
