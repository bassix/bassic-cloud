import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSnackBarModule,
    TranslateModule,
  ],
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.scss'],
})
export class AccountPageComponent implements OnInit {
  public form: FormGroup;
  public loading = false;
  public hidePassword = true;

  public constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly snackBar: MatSnackBar,
    private readonly translate: TranslateService,
    private readonly router: Router,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      confirmPassword: [''],
    });
  }

  public get currentUser(): import('@core/models/api.models').User | null { return this.authService.currentUser; }

  public ngOnInit(): void {
    if (!this.authService.isAuthenticated) {
      void this.router.navigate(['/login']);

      return;
    }

    if (this.currentUser) {
      this.form.patchValue({ email: this.currentUser.email });
    }
  }

  public onSave(): void {
    if (this.form.invalid || this.loading) return;

    const { password, confirmPassword, email } = this.form.value as { email: string; password: string; confirmPassword: string };

    if (password && password !== confirmPassword) {
      this.snackBar.open(this.translate.instant('account.passwordMismatch'), '', { duration: 3000 });

      return;
    }

    if (!this.currentUser) return;

    this.loading = true;
    const update: Record<string, string> = { email };

    if (password) { update['password'] = password; }

    this.userService.updateUser(this.currentUser.id, update).subscribe({
      next: () => {
        this.loading = false;
        this.form.patchValue({ password: '', confirmPassword: '' });
        this.snackBar.open(this.translate.instant('account.saved'), '', { duration: 3000 });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open(this.translate.instant('common.error'), '', { duration: 3000 });
      },
    });
  }
}
