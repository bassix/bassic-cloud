import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { interval, Subject, takeUntil } from 'rxjs';
import { LogService } from '@core/services/log.service';
import { AccessLogEntry, ChartDataPoint } from '@core/models/api.models';

/** How to bucket chart data by time resolution */
export type ChartResolution = 'second' | 'minute' | 'hour';

export interface ChartPoint {
  name: Date;
  value: number;
}

export interface ChartLine {
  name: string;
  series: ChartPoint[];
}

@Component({
  selector: 'app-log-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatTooltipModule,
    TranslateModule,
    NgxChartsModule,
  ],
  templateUrl: './log-list.component.html',
  styleUrls: ['./log-list.component.scss'],
})
export class LogListComponent implements OnInit, OnDestroy {
  public logs: AccessLogEntry[] = [];
  public failedLogs: AccessLogEntry[] = [];
  public totalLogs = 0;
  public totalFailed = 0;
  public currentPage = 1;
  public failedPage = 1;
  public pageSize = 50;
  public displayedColumns = ['date', 'user', 'ip', 'action', 'detail'];
  public failedColumns = ['date', 'ip', 'detail'];

  /** ngx-charts line data */
  public chartLines: ChartLine[] = [];
  public chartResolution: ChartResolution = 'minute';

  /** Raw data from backend, re-bucketed on resolution change */
  private rawChartData: ChartDataPoint[] = [];
  private readonly destroy$ = new Subject<void>();

  public readonly colorScheme = 'cool';

  public constructor(private logService: LogService) {}

  public ngOnInit(): void {
    this.loadAccessLogs();
    this.loadChart();

    // Refresh chart every 30 s for a "live" feel
    interval(30_000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadChart());
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public onTabChange(index: number): void {
    if (index === 1 && this.failedLogs.length === 0) {
      this.loadFailedLogs();
    }
  }

  public loadAccessLogs(): void {
    this.logService.getAccessLogs(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.logs = res.data;
        this.totalLogs = res.meta.total;
      },
    });
  }

  public loadFailedLogs(): void {
    this.logService.getFailedLogs(this.failedPage, this.pageSize).subscribe({
      next: (res) => {
        this.failedLogs = res.data;
        this.totalFailed = res.meta.total;
      },
    });
  }

  public loadChart(): void {
    this.logService.getChartData(30).subscribe({
      next: (res) => {
        if (res.success) {
          this.rawChartData = res.data;
          this.rebuildChart();
        }
      },
    });
  }

  public onResolutionChange(res: ChartResolution): void {
    this.chartResolution = res;
    this.rebuildChart();
  }

  public onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadAccessLogs();
  }

  public onFailedPageChange(event: PageEvent): void {
    this.failedPage = event.pageIndex + 1;
    this.loadFailedLogs();
  }

  public getActionClass(action: string): string {
    switch (action) {
      case 'login_success': return 'bg-green-100 text-green-800';
      case 'login_fail': return 'bg-red-100 text-red-800';
      case 'logout': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  /** Rebuild chart series from raw data using the selected time resolution */
  private rebuildChart(): void {
    if (this.rawChartData.length === 0) {
      this.chartLines = [];
      return;
    }

    const totalSeries: ChartPoint[] = [];
    const failedSeries: ChartPoint[] = [];

    for (const point of this.rawChartData) {
      const date = new Date(point.date);
      const bucketed = this.bucketDate(date);
      totalSeries.push({ name: bucketed, value: point.total });
      failedSeries.push({ name: bucketed, value: point.failed });
    }

    // Deep-copy so ngx-charts detects change
    this.chartLines = [
      { name: 'Total', series: [...totalSeries] },
      { name: 'Failed', series: [...failedSeries] },
    ];
  }

  private bucketDate(d: Date): Date {
    const out = new Date(d);

    if (this.chartResolution === 'hour') {
      out.setMinutes(0, 0, 0);
    } else if (this.chartResolution === 'minute') {
      out.setSeconds(0, 0);
    }
    // 'second' — keep as-is

    return out;
  }
}
