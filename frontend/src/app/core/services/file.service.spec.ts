import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FileService } from './file.service';
import { environment } from '@env/environment';

describe('FileService', () => {
  let service: FileService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should fetch files with pagination', () => {
    const mockResponse = {
      success: true,
      data: [
        {
          id: 1,
          originalName: 'photo.jpg',
          mimeType: 'image/jpeg',
          size: '2048',
          isImage: true,
          isVideo: false,
          isAudio: false,
          ownerId: 1,
          ownerName: 'admin',
          createdAt: '2026-03-07T00:00:00Z',
          updatedAt: '2026-03-07T00:00:00Z',
        },
      ],
      meta: { total: 1, page: 1, limit: 50, pages: 1 },
    };

    service.getFiles(1, 50).subscribe((res) => {
      expect(res.data.length).toBe(1);
      expect(res.data[0].originalName).toBe('photo.jpg');
      expect(res.meta.total).toBe(1);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/files?page=1&limit=50`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should upload a file via FormData', () => {
    const blob = new Blob(['test'], { type: 'text/plain' });
    const file = new File([blob], 'test.txt', { type: 'text/plain' });

    service.uploadFile(file).subscribe((res) => {
      expect(res.success).toBe(true);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/files`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush({ success: true, data: { id: 2, originalName: 'test.txt' } });
  });

  it('should return correct stream URL', () => {
    expect(service.getStreamUrl(42)).toBe(`${environment.apiUrl}/files/42/stream`);
  });

  it('should return correct download URL', () => {
    expect(service.getDownloadUrl(42)).toBe(`${environment.apiUrl}/files/42/download`);
  });

  it('should delete a file', () => {
    service.deleteFile(5).subscribe((res) => {
      expect(res.success).toBe(true);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/files/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, data: { message: 'File deleted.' } });
  });

  it('should rename a file', () => {
    service.renameFile(3, 'new-name.pdf').subscribe((res) => {
      expect(res.success).toBe(true);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/files/3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ originalName: 'new-name.pdf' });
    req.flush({ success: true, data: { id: 3, originalName: 'new-name.pdf' } });
  });
});
