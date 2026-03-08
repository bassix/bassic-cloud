import { Component, ElementRef, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { FileService } from '@core/services/file.service';
import { FileItem } from '@core/models/api.models';
import { FileSizePipe } from '@shared/pipes/file-size.pipe';
import { LocaleDatePipe } from '@shared/pipes/locale-date.pipe';

export type MediaViewMode = 'list' | 'grid' | 'slider' | 'player';

@Component({
  selector: 'app-media',
  imports: [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
    TranslateModule,
    FileSizePipe,
    LocaleDatePipe,
  ],
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss'],
})
export class MediaComponent implements OnInit {
  public readonly videoPlayer = viewChild<ElementRef<HTMLVideoElement>>('videoPlayer');
  public readonly audioPlayer = viewChild<ElementRef<HTMLAudioElement>>('audioPlayer');

  public viewMode: MediaViewMode = 'list';

  /* --- All files (list view) --- */
  public allFiles: FileItem[] = [];
  public totalFiles = 0;
  public currentPage = 1;
  public pageSize = 50;

  /* --- Images --- */
  public photos: FileItem[] = [];

  /* --- Videos --- */
  public videos: FileItem[] = [];
  public selectedVideo: FileItem | null = null;

  /* --- Audio --- */
  public audioFiles: FileItem[] = [];
  public selectedAudio: FileItem | null = null;

  /* --- Slider --- */
  public currentSlide = 0;

  /* --- Thumbnails --- */
  public thumbUrls = new Map<number, string>();
  public fullUrls = new Map<number, string>();

  public constructor(
    public fileService: FileService,
  ) {}

  public ngOnInit(): void {
    this.loadAll();
  }

  public setView(mode: MediaViewMode): void {
    this.viewMode = mode;

    if (mode === 'grid' || mode === 'slider') {
      this.loadPhotos();
    } else if (mode === 'player') {
      this.loadMedia();
    }
  }

  /* ---- List ---- */
  public loadAll(): void {
    this.fileService.getFiles(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.allFiles = res.data;
        this.totalFiles = res.meta.total;
        this.loadThumbs(res.data);
      },
    });
  }

  public onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadAll();
  }

  /* ---- Gallery / Slider ---- */
  public loadPhotos(): void {
    if (this.photos.length > 0) { return; }

    this.fileService.getImages(1, 200).subscribe({
      next: (res) => {
        this.photos = res.data;
        this.loadPhotosUrls(res.data);
      },
    });
  }

  public openSlider(index: number): void {
    this.currentSlide = index;
    this.viewMode = 'slider';
    this.loadPhotos();
  }

  public nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.photos.length;
  }

  public prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.photos.length) % this.photos.length;
  }

  /* ---- Player ---- */
  public loadMedia(): void {
    if (this.videos.length === 0) {
      this.fileService.getVideos(1, 200).subscribe({
        next: (res) => {
          this.videos = res.data;

          if (this.videos.length > 0 && !this.selectedVideo) {
            this.selectedVideo = this.videos[0];
          }
        },
      });
    }

    if (this.audioFiles.length === 0) {
      this.fileService.getAudio(1, 200).subscribe({
        next: (res) => {
          this.audioFiles = res.data;

          if (this.audioFiles.length > 0 && !this.selectedAudio) {
            this.selectedAudio = this.audioFiles[0];
          }
        },
      });
    }
  }

  public selectVideo(video: FileItem): void {
    this.selectedVideo = video;
    setTimeout(() => {
      this.videoPlayer()?.nativeElement.load();
      void this.videoPlayer()?.nativeElement.play();
    }, 100);
  }

  public selectAudio(audio: FileItem): void {
    this.selectedAudio = audio;
    setTimeout(() => {
      this.audioPlayer()?.nativeElement.load();
      void this.audioPlayer()?.nativeElement.play();
    }, 100);
  }

  /* ---- Helpers ---- */
  public getFileIcon(file: FileItem): string {
    if (file.isImage) { return 'image'; }

    if (file.isVideo) { return 'videocam'; }

    if (file.isAudio) { return 'audiotrack'; }

    if (file.mimeType.includes('pdf')) { return 'picture_as_pdf'; }

    return 'insert_drive_file';
  }

  public getIconColor(file: FileItem): string {
    if (file.isImage) { return 'text-jungle-500'; }

    if (file.isVideo) { return 'text-lagoon-500'; }

    if (file.isAudio) { return 'text-coral-500'; }

    return 'text-sand-500';
  }

  public getThumbUrl(file: FileItem): string {
    return this.thumbUrls.get(file.id) ?? '';
  }

  public getFullUrl(photo: FileItem): string {
    return this.fullUrls.get(photo.id) ?? this.thumbUrls.get(photo.id) ?? '';
  }

  public getStreamUrl(item: FileItem): string {
    return this.fileService.getStreamUrl(item.id);
  }

  public getDownloadUrl(item: FileItem): string {
    return this.fileService.getDownloadUrl(item.id);
  }

  public openVideoInline(file: FileItem): void {
    this.selectedVideo = file;
    this.viewMode = 'player';
    this.loadMedia();
  }

  public openAudioInline(file: FileItem): void {
    this.selectedAudio = file;
    this.viewMode = 'player';
    this.loadMedia();
  }

  private loadThumbs(files: FileItem[]): void {
    for (const file of files) {
      if ((file.isImage || file.isVideo) && !this.thumbUrls.has(file.id)) {
        this.fileService.getThumbUrl(file.id, 360, 360).subscribe({
          next: (res) => {
            if (res.success) { this.thumbUrls.set(file.id, res.data.url); }
          },
        });
      }
    }
  }

  private loadPhotosUrls(photos: FileItem[]): void {
    for (const photo of photos) {
      this.fileService.getThumbUrl(photo.id, 360, 360).subscribe({
        next: (res) => {
          if (res.success) { this.thumbUrls.set(photo.id, res.data.url); }
        },
      });

      this.fileService.getThumbUrl(photo.id, 1280, 900).subscribe({
        next: (res) => {
          if (res.success) { this.fullUrls.set(photo.id, res.data.url); }
        },
      });
    }
  }
}
