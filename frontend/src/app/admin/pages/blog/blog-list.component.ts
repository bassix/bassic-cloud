import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { LocaleDatePipe } from '@shared/pipes/locale-date.pipe';

interface BlogPost {
  id: number;
  title: string;
  subtitle: string;
  slug: string;
  status: string;
  authorName: string;
  publishedAt: string | null;
  tags: string[];
  createdAt: string;
}

@Component({
  selector: 'app-admin-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule, MatChipsModule,
    MatIconModule, MatTableModule, MatTooltipModule, TranslateModule, LocaleDatePipe],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss'],
})
export class BlogListComponent implements OnInit {
  public posts: BlogPost[] = [];
  public displayedColumns = ['title', 'status', 'author', 'publishedAt', 'tags', 'actions'];

  public constructor(
    private readonly http: HttpClient,
    private readonly translate: TranslateService,
  ) {}

  public ngOnInit(): void { this.loadPosts(); }

  public loadPosts(): void {
    this.http.get<{ success: boolean; data: BlogPost[] }>(`${environment.apiUrl}/blog/admin/posts`).subscribe({
      next: (res) => { if (res.success) { this.posts = res.data; } },
    });
  }

  public deletePost(post: BlogPost): void {
    if (!confirm(this.translate.instant('blog.confirmDelete'))) { return; }

    this.http.delete(`${environment.apiUrl}/blog/admin/posts/${post.id}`).subscribe({
      next: () => void this.loadPosts(),
    });
  }

  public getStatusColor(status: string): string {
    const map: Record<string, string> = { published: 'text-jungle-600', draft: 'text-sand-500', archived: 'text-coral-400' };

    return map[status] ?? '';
  }
}
