import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FileService, UploadProgress } from '@core/services/file.service';
import { FileItem } from '@core/models/api.models';
import { FileSizePipe } from '@shared/pipes/file-size.pipe';
import { LocaleDatePipe } from '@shared/pipes/locale-date.pipe';

export type ViewMode = 'table' | 'grid';

export interface UploadTask {
  file: File;
  progress: UploadProgress;
}

@Component({
  selector: 'app-admin-files',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    TranslateModule,
    FileSizePipe,
    LocaleDatePipe,
  ],
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
})
export class FilesComponent implements OnInit {
  public files: FileItem[] = [];
  public totalFiles = 0;
  public currentPage = 1;
  public pageSize = 50;
  public displayedColumns = ['icon', 'name', 'type', 'size', 'uploaded', 'actions'];

  public isDragging = false;
  public editingFileId: number | null = null;
  public editingName = '';
  public viewMode: ViewMode = 'table';

  /** Signed thumbnail URLs keyed by file ID */
  public thumbUrls = new Map<number, string>();

  /** Active upload queue — each item tracks its own progress */
  public uploads: UploadTask[] = [];

  public constructor(
    public fileService: FileService,
    private readonly snackBar: MatSnackBar,
    private readonly translate: TranslateService,
  ) {}

  public ngOnInit(): void {
    this.loadFiles();
  }

  public get hasActiveUploads(): boolean {
    return this.uploads.some((u) => u.progress.state === 'uploading' || u.progress.state === 'pending');
  }

  public loadFiles(): void {
    this.fileService.getFiles(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.files = res.data;
        this.totalFiles = res.meta.total;
        this.loadThumbUrls(res.data);
      },
    });
  }

  private loadThumbUrls(files: FileItem[]): void {
    for (const file of files) {
      if (file.isImage || file.isVideo) {
        this.fileService.getThumbUrl(file.id, 360, 360).subscribe({
          next: (res) => {
            if (res.success) {
              this.thumbUrls.set(file.id, res.data.url);
            }
          },
        });
      }
    }
  }

  public onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadFiles();
  }

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const dropped = event.dataTransfer?.files;

    if (dropped) {
      this.uploadFiles(Array.from(dropped));
    }
  }

  public onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files) {
      this.uploadFiles(Array.from(input.files));
      input.value = '';
    }
  }

  public dismissUpload(task: UploadTask): void {
    this.uploads = this.uploads.filter((u) => u !== task);
  }

  public clearFinished(): void {
    this.uploads = this.uploads.filter(
      (u) => u.progress.state === 'uploading' || u.progress.state === 'pending',
    );
  }

  private uploadFiles(files: File[]): void {
    if (files.length === 0) {
      return;
    }

    for (const file of files) {
      const task: UploadTask = {
        file,
        progress: { state: 'pending', percent: 0, bytesLoaded: 0, bytesTotal: file.size, speedBytesPerSecond: 0 },
      };

      this.uploads.push(task);

      this.fileService.uploadWithProgress(file).subscribe({
        next: (progress) => {
          task.progress = progress;
        },
        complete: () => {
          if (task.progress.state === 'done') {
            this.loadFiles();
            this.snackBar.open(
              this.translate.instant('files.uploadSuccess', { name: file.name }) as string,
              this.translate.instant('common.close') as string,
              { duration: 3000 },
            );
          }
        },
      });
    }
  }

  public startRename(file: FileItem): void {
    this.editingFileId = file.id;
    this.editingName = file.originalName;
  }

  public saveRename(file: FileItem): void {
    if (this.editingName.trim()) {
      this.fileService.renameFile(file.id, this.editingName.trim()).subscribe({
        next: () => {
          this.editingFileId = null;
          this.loadFiles();
        },
      });
    }
  }

  public cancelRename(): void {
    this.editingFileId = null;
  }

  public deleteFile(file: FileItem): void {
    if (!confirm(this.translate.instant('files.confirmDelete') as string)) {
      return;
    }

    this.fileService.deleteFile(file.id).subscribe({
      next: () => void this.loadFiles(),
    });
  }

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

  public getThumbnailUrl(file: FileItem): string {
    return this.thumbUrls.get(file.id) ?? '';
  }

  public formatSpeed(bps: number): string {
    if (bps === 0) { return '—'; }

    if (bps < 1024) { return `${bps} B/s`; }

    if (bps < 1024 * 1024) { return `${(bps / 1024).toFixed(1)} KB/s`; }

    return `${(bps / (1024 * 1024)).toFixed(1)} MB/s`;
  }
}
