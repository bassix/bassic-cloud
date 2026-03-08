import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { NgxEditorModule, Editor, Toolbar } from 'ngx-editor';
import { environment } from '@env/environment';

interface BlogPost {
  id: number;
  title: string;
  subtitle: string;
  bodyContent: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  tags: string[];
  coverFileId: number | null;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-blog-editor',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    MatButtonModule, MatCardModule, MatChipsModule, MatFormFieldModule,
    MatIconModule, MatInputModule, MatProgressSpinnerModule, MatSelectModule, MatSnackBarModule,
    TranslateModule, NgxEditorModule,
  ],
  templateUrl: './blog-editor.component.html',
  styleUrls: ['./blog-editor.component.scss'],
})
export class BlogEditorComponent implements OnInit, OnDestroy {
  public editor!: Editor;
  public toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    ['ordered_list', 'bullet_list'],
    ['link', 'image'],
    ['blockquote', 'code'],
    [{ heading: ['h1', 'h2', 'h3', 'h4'] }],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
    ['undo', 'redo'],
  ];

  public form!: FormGroup;
  public tags: string[] = [];
  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public postId: number | null = null;
  public saving = false;
  public saveError = '';
  public statusOptions = ['draft', 'published', 'archived'];

  public constructor(
    private readonly fb: FormBuilder,
    private readonly http: HttpClient,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly translate: TranslateService,
  ) {}

  public ngOnInit(): void {
    this.editor = new Editor();
    this.form = this.fb.group({
      title: ['', Validators.required],
      subtitle: [''],
      bodyContent: [''],
      slug: [''],
      status: ['draft', Validators.required],
      publishedAt: [''],
      coverFileId: [null],
    });

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.postId = Number(id);
      this.http.get<{ success: boolean; data: BlogPost }>(`${environment.apiUrl}/blog/admin/posts/${this.postId}`).subscribe({
        next: (res) => {
          if (res.success) {
            const post: BlogPost = res.data;

            this.form.patchValue({
              title: post.title,
              subtitle: post.subtitle,
              bodyContent: post.bodyContent,
              slug: post.slug,
              status: post.status,
              publishedAt: post.publishedAt ? post.publishedAt.slice(0, 16) : '',
              coverFileId: post.coverFileId,
            });
            this.tags = Array.isArray(post.tags) ? post.tags : [];
          }
        },
      });
    }
  }

  public ngOnDestroy(): void {
    this.editor.destroy();
  }

  public addTag(event: MatChipInputEvent): void {
    const value = (event.value ?? '').trim();

    if (value) { this.tags.push(value); }

    event.chipInput?.clear();
  }

  public removeTag(tag: string): void {
    this.tags = this.tags.filter((t) => t !== tag);
  }

  public save(): void {
    if (this.form.invalid || this.saving) {
      return;
    }

    this.saving = true;
    this.saveError = '';
    const formVal = this.form.value as {
      title: string; subtitle: string; bodyContent: string; slug: string;
      status: string; publishedAt: string; coverFileId: number | null;
    };
    const body = {
      ...formVal,
      tags: this.tags,
      publishedAt: formVal.publishedAt || null,
    };

    const req = this.postId
      ? this.http.put(`${environment.apiUrl}/blog/admin/posts/${this.postId}`, body)
      : this.http.post(`${environment.apiUrl}/blog/admin/posts`, body);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open(this.translate.instant('common.saved') as string, '', { duration: 2000 });
        void this.router.navigate(['/admin/blog']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving = false;
        this.saveError = err.error?.message ?? (this.translate.instant('common.error') as string);
      },
    });
  }
}
