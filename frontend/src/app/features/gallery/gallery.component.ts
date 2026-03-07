import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { FileService } from '@core/services/file.service';
import { FileItem } from '@core/models/api.models';

@Component({
  selector: 'app-gallery',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatCardModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  public photos: FileItem[] = [];
  public viewMode: 'grid' | 'slider' = 'grid';
  public currentSlide = 0;

  /** Signed thumbnail URLs keyed by file ID */
  public thumbUrls = new Map<number, string>();

  /** Full-size signed URLs for slider view keyed by file ID */
  public fullUrls = new Map<number, string>();

  public constructor(private fileService: FileService) {}

  public ngOnInit(): void {
    this.loadPhotos();
  }

  private loadPhotos(): void {
    this.fileService.getImages(1, 200).subscribe({
      next: (res) => {
        this.photos = res.data;
        this.loadThumbUrls(res.data);
      },
    });
  }

  private loadThumbUrls(photos: FileItem[]): void {
    for (const photo of photos) {
      // Grid thumbnails — 360×360
      this.fileService.getThumbUrl(photo.id, 360, 360).subscribe({
        next: (res) => {
          if (res.success) {
            this.thumbUrls.set(photo.id, res.data.url);
          }
        },
      });

      // Slider full-size — 1280×900
      this.fileService.getThumbUrl(photo.id, 1280, 900).subscribe({
        next: (res) => {
          if (res.success) {
            this.fullUrls.set(photo.id, res.data.url);
          }
        },
      });
    }
  }

  public getThumbUrl(photo: FileItem): string {
    return this.thumbUrls.get(photo.id) ?? '';
  }

  public getFullUrl(photo: FileItem): string {
    return this.fullUrls.get(photo.id) ?? this.thumbUrls.get(photo.id) ?? '';
  }

  public openSlider(index: number): void {
    this.currentSlide = index;
    this.viewMode = 'slider';
  }

  public nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.photos.length;
  }

  public prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.photos.length) % this.photos.length;
  }
}
