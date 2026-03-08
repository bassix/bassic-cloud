import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpParams, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse, FileItem, PaginatedResponse } from '../models/api.models';

export interface UploadProgress {
  state: 'pending' | 'uploading' | 'done' | 'error';
  percent: number;
  bytesLoaded: number;
  bytesTotal: number;
  speedBytesPerSecond: number;
  error?: string;
  file?: FileItem;
}

@Injectable({ providedIn: 'root' })
export class FileService {
  private readonly baseUrl = `${environment.apiUrl}/files`;

  public constructor(private readonly http: HttpClient) {}

  public getFiles(page: number = 1, limit: number = 50, mime?: string): Observable<PaginatedResponse<FileItem>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (mime) {
      params = params.set('mime', mime);
    }

    return this.http.get<PaginatedResponse<FileItem>>(this.baseUrl, { params });
  }

  public getImages(page: number = 1, limit: number = 50): Observable<PaginatedResponse<FileItem>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<FileItem>>(`${this.baseUrl}/images`, { params });
  }

  public getVideos(page: number = 1, limit: number = 50): Observable<PaginatedResponse<FileItem>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<FileItem>>(`${this.baseUrl}/videos`, { params });
  }

  public getAudio(page: number = 1, limit: number = 50): Observable<PaginatedResponse<FileItem>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<FileItem>>(`${this.baseUrl}/audio`, { params });
  }

  public uploadFile(file: File): Observable<ApiResponse<FileItem>> {
    const formData = new FormData();

    formData.append('file', file, file.name);

    return this.http.post<ApiResponse<FileItem>>(this.baseUrl, formData);
  }

  public uploadWithProgress(file: File): Observable<UploadProgress> {
    const formData = new FormData();

    formData.append('file', file, file.name);

    const req = new HttpRequest('POST', this.baseUrl, formData, { reportProgress: true });
    const startTime = Date.now();

    return new Observable<UploadProgress>((observer) => {
      observer.next({ state: 'pending', percent: 0, bytesLoaded: 0, bytesTotal: file.size, speedBytesPerSecond: 0 });

      const sub = this.http.request<ApiResponse<FileItem>>(req).subscribe({
        next: (event) => {
          const elapsed = (Date.now() - startTime) / 1000 || 0.001;

          if (event.type === HttpEventType.UploadProgress && event.total) {
            const percent = Math.round((event.loaded / event.total) * 100);

            observer.next({
              state: 'uploading',
              percent,
              bytesLoaded: event.loaded,
              bytesTotal: event.total,
              speedBytesPerSecond: Math.round(event.loaded / elapsed),
            });
          } else if (event.type === HttpEventType.Response) {
            const body = event.body;

            observer.next({
              state: 'done',
              percent: 100,
              bytesLoaded: file.size,
              bytesTotal: file.size,
              speedBytesPerSecond: Math.round(file.size / elapsed),
              file: body?.data,
            });
            observer.complete();
          }
        },
        error: (err: unknown) => {
          const msg = err instanceof Error ? err.message
            : (typeof err === 'object' && err !== null && 'error' in err
              ? String((err as {error: {detail?: string; message?: string}}).error?.detail
                ?? (err as {error: {message?: string}}).error?.message ?? 'Upload failed')
              : 'Upload failed');

          observer.next({ state: 'error', percent: 0, bytesLoaded: 0, bytesTotal: file.size, speedBytesPerSecond: 0, error: msg });
          observer.complete();
        },
      });

      return () => void sub.unsubscribe();
    });
  }

  public renameFile(id: number, originalName: string): Observable<ApiResponse<FileItem>> {
    return this.http.put<ApiResponse<FileItem>>(`${this.baseUrl}/${id}`, { originalName });
  }

  public deleteFile(id: number): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(`${this.baseUrl}/${id}`);
  }

  public getDownloadUrl(id: number): string {
    return `${this.baseUrl}/${id}/download`;
  }

  public getStreamUrl(id: number): string {
    return `${this.baseUrl}/${id}/stream`;
  }

  /**
   * Fetch a short-lived signed thumbnail URL from the backend.
   * The URL points to /thumb/{w}x{h}/{token} which is publicly accessible.
   */
  public getThumbUrl(id: number, w: number = 360, h: number = 360): Observable<ApiResponse<{ url: string; w: number; h: number }>> {
    return this.http.get<ApiResponse<{ url: string; w: number; h: number }>>(
      `${this.baseUrl}/${id}/thumb-url`,
      { params: new HttpParams().set('w', w.toString()).set('h', h.toString()) },
    );
  }
}
