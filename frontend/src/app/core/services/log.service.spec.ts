import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { LogService } from './log.service';

describe('LogService', () => {
  let service: LogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LogService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(LogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => void httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch access logs', () => {
    const mockResponse = {
      success: true,
      data: [{ id: 1, action: 'login', ip: '127.0.0.1', detail: '', userId: 1, username: 'admin', createdAt: '' }],
      meta: { total: 1, page: 1, limit: 50, pages: 1 },
    };

    service.getAccessLogs(1, 50).subscribe((res) => {
      expect(res.data.length).toBe(1);
      expect(res.data[0].action).toBe('login');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/logs/access?page=1&limit=50`);

    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch failed logs', () => {
    service.getFailedLogs(1, 50).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/logs/failed?page=1&limit=50`);

    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [], meta: { total: 0, page: 1, limit: 50, pages: 0 } });
  });

  it('should fetch chart data', () => {
    service.getChartData(7).subscribe((res) => {
      expect(res.success).toBe(true);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/logs/chart-data?days=7`);

    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });
});
