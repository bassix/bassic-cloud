import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '@env/environment';
import { LocaleDatePipe } from '@shared/pipes/locale-date.pipe';

interface BlogPostSummary {
  id: number;
  title: string;
  subtitle: string;
  slug: string;
  authorName: string;
  publishedAt: string;
  tags: string[];
}

interface PaginatedBlog {
  data: BlogPostSummary[];
  total: number;
  page: number;
  limit: number;
}

@Component({
  selector: 'app-blog-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule,
    LocaleDatePipe,
  ],
  templateUrl: './blog-list-page.component.html',
  styleUrls: ['./blog-list-page.component.scss'],
})
export class BlogListPageComponent implements OnInit {
  public posts: BlogPostSummary[] = [];
  public loading = true;
  public error = false;
  public lang = 'en';

  public constructor(
    private readonly http: HttpClient,
    private readonly route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    this.lang = this.route.parent?.snapshot.paramMap.get('lang') ?? 'en';

    this.http.get<PaginatedBlog>(`${environment.apiUrl}/blog`).subscribe({
      next: (res) => {
        this.posts = res.data;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }
}
