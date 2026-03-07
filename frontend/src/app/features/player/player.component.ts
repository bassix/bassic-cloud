import { Component, OnInit, ElementRef, viewChild } from '@angular/core';

import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatListModule } from '@angular/material/list';
import { TranslateModule } from '@ngx-translate/core';
import { FileService } from '@core/services/file.service';
import { FileItem } from '@core/models/api.models';
import { FileSizePipe } from '@shared/pipes/file-size.pipe';

@Component({
  selector: 'app-player',
  imports: [
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSliderModule,
    MatListModule,
    TranslateModule,
    FileSizePipe
  ],
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  public readonly videoPlayer = viewChild<ElementRef<HTMLVideoElement>>('videoPlayer');
  public readonly audioPlayer = viewChild<ElementRef<HTMLAudioElement>>('audioPlayer');

  public videos: FileItem[] = [];
  public audioFiles: FileItem[] = [];
  public selectedVideo: FileItem | null = null;
  public selectedAudio: FileItem | null = null;

  public constructor(private fileService: FileService) {}

  public ngOnInit(): void {
    this.loadMedia();
  }

  private loadMedia(): void {
    this.fileService.getVideos(1, 200).subscribe({
      next: (res) => {
        this.videos = res.data;
        if (this.videos.length > 0) {
          this.selectedVideo = this.videos[0];
        }
      },
    });

    this.fileService.getAudio(1, 200).subscribe({
      next: (res) => {
        this.audioFiles = res.data;
        if (this.audioFiles.length > 0) {
          this.selectedAudio = this.audioFiles[0];
        }
      },
    });
  }

  public selectVideo(video: FileItem): void {
    this.selectedVideo = video;
    setTimeout(() => {
      this.videoPlayer()?.nativeElement.load();
      this.videoPlayer()?.nativeElement.play();
    }, 100);
  }

  public selectAudio(audio: FileItem): void {
    this.selectedAudio = audio;
    setTimeout(() => {
      this.audioPlayer()?.nativeElement.load();
      this.audioPlayer()?.nativeElement.play();
    }, 100);
  }

  public getStreamUrl(item: FileItem): string {
    return this.fileService.getStreamUrl(item.id);
  }

  public getDownloadUrl(item: FileItem): string {
    return this.fileService.getDownloadUrl(item.id);
  }
}
