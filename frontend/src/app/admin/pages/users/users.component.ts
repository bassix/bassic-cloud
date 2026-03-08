import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from '@core/services/user.service';
import { User } from '@core/models/api.models';

@Component({
    selector: 'app-admin-users',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCardModule,
        MatSnackBarModule,
        MatChipsModule,
        TranslateModule,
    ],
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  public users: User[] = [];
  public totalUsers = 0;
  public currentPage = 1;
  public pageSize = 20;
  public displayedColumns = ['username', 'email', 'roles', 'created', 'actions'];

  public showForm = false;
  public editingUser: User | null = null;
  public userForm!: FormGroup;

  public constructor(
    private readonly userService: UserService,
    private readonly fb: FormBuilder,
    private readonly snackBar: MatSnackBar,
    private readonly translate: TranslateService,
  ) {
    this.initForm();
  }

  public ngOnInit(): void {
    this.loadUsers();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(8)]],
      roles: [['ROLE_USER']],
      locale: ['en'],
    });
  }

  public loadUsers(): void {
    this.userService.getUsers(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.users = res.data;
        this.totalUsers = res.meta.total;
      },
    });
  }

  public onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  public openForm(): void {
    this.editingUser = null;
    this.userForm.reset({ roles: ['ROLE_USER'], locale: 'en' });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showForm = true;
  }

  public editUser(user: User): void {
    this.editingUser = user;
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      roles: user.roles,
      locale: user.locale,
      password: '',
    });
    // Password optional when editing
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.setValidators([Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showForm = true;
  }

  public closeForm(): void {
    this.showForm = false;
    this.editingUser = null;
  }

  public saveUser(): void {
    if (this.userForm.invalid) return;

    const data = { ...this.userForm.value };

    if (!data.password) {
      delete data.password;
    }

    const request = this.editingUser
      ? this.userService.updateUser(this.editingUser.id, data)
      : this.userService.createUser(data);

    request.subscribe({
      next: () => {
        this.snackBar.open(
          this.translate.instant('common.save') + ' ✓',
          this.translate.instant('common.close'),
          { duration: 2000 },
        );
        this.closeForm();
        this.loadUsers();
      },
      error: (err) => {
        this.snackBar.open(
          err.error?.message || this.translate.instant('common.error'),
          this.translate.instant('common.close'),
          { duration: 4000 },
        );
      },
    });
  }

  public deleteUser(user: User): void {
    if (!confirm(this.translate.instant('users.confirmDelete'))) return;

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.loadUsers();
        this.snackBar.open('Deleted', this.translate.instant('common.close'), { duration: 2000 });
      },
    });
  }
}
