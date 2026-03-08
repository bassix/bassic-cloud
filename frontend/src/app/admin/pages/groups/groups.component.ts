import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

interface UserGroup { id: number; name: string; description: string | null; ownerName: string; memberCount: number; createdAt: string }

@Component({
  selector: 'app-admin-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatCardModule, MatChipsModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatSnackBarModule,
    MatTableModule, MatTooltipModule, TranslateModule],
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
})
export class GroupsComponent implements OnInit {
  public groups: UserGroup[] = [];
  public displayedColumns = ['name', 'description', 'owner', 'members', 'actions'];
  public showForm = false;
  public editingId: number | null = null;
  public form: FormGroup;

  public constructor(
    private readonly http: HttpClient,
    private readonly fb: FormBuilder,
    private readonly snackBar: MatSnackBar,
    private readonly translate: TranslateService,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });
  }

  public ngOnInit(): void { this.loadGroups(); }

  public loadGroups(): void {
    this.http.get<{ success: boolean; data: UserGroup[] }>(`${environment.apiUrl}/groups`).subscribe({
      next: (res) => { if (res.success) { this.groups = res.data; } },
    });
  }

  public openCreate(): void { this.editingId = null; this.form.reset(); this.showForm = true; }

  public openEdit(group: UserGroup): void {
    this.editingId = group.id;
    this.form.patchValue({ name: group.name, description: group.description });
    this.showForm = true;
  }

  public save(): void {
    if (this.form.invalid) { return; }

    const body = this.form.value;
    const req = this.editingId
      ? this.http.put(`${environment.apiUrl}/groups/${this.editingId}`, body)
      : this.http.post(`${environment.apiUrl}/groups`, body);

    req.subscribe({ next: () => { this.showForm = false; this.loadGroups(); } });
  }

  public deleteGroup(group: UserGroup): void {
    if (!confirm(this.translate.instant('groups.confirmDelete'))) { return; }

    this.http.delete(`${environment.apiUrl}/groups/${group.id}`).subscribe({ next: () => void this.loadGroups() });
  }
}
