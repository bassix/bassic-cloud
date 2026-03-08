import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MatButtonModule} from '@angular/material/button';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {TranslateModule} from '@ngx-translate/core';
import {environment} from '@env/environment';
import {LocaleDatePipe} from '@shared/pipes/locale-date.pipe';

interface BlogPost {
  id: number;
  title: string;
  subtitle: string;
  bodyContent: string;
  slug: string;
  authorName: string;
  publishedAt: string;
  tags: string[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Component({
  selector: 'app-blog-post-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatChipsModule,
    MatIconModule, MatProgressSpinnerModule, TranslateModule, LocaleDatePipe],
  templateUrl: './blog-post-page.component.html',
  styleUrls: ['./blog-post-page.component.scss'],
})
export class BlogPostPageComponent implements OnInit {
  public post: BlogPost | null = null;
  public loading = true;
  public error = false;
  public lang = 'en';

  public constructor(
    private readonly route: ActivatedRoute,
    private readonly http: HttpClient,
  ) {}

  public ngOnInit(): void {
    this.lang = this.route.parent?.snapshot.paramMap.get('lang') ?? 'en';
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';

    this.http.get<ApiResponse<BlogPost>>(`${environment.apiUrl}/blog/${slug}`).subscribe({
      next: (res) => {
        this.post = res.data;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }
}
