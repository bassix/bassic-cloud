import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  AccessLogEntry,
  ApiResponse,
  ChartDataPoint,
  PaginatedResponse,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class LogService {
  private readonly baseUrl = `${environment.apiUrl}/logs`;

  public constructor(private readonly http: HttpClient) {}

  public getAccessLogs(page: number = 1, limit: number = 50): Observable<PaginatedResponse<AccessLogEntry>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<AccessLogEntry>>(`${this.baseUrl}/access`, { params });
  }

  public getFailedLogs(page: number = 1, limit: number = 50): Observable<PaginatedResponse<AccessLogEntry>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<AccessLogEntry>>(`${this.baseUrl}/failed`, { params });
  }

  public getChartData(days: number = 30): Observable<ApiResponse<ChartDataPoint[]>> {
    const params = new HttpParams().set('days', days.toString());

    return this.http.get<ApiResponse<ChartDataPoint[]>>(`${this.baseUrl}/chart-data`, { params });
  }
}
