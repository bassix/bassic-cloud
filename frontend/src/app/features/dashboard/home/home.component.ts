import { Component, OnInit } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AuthService } from '@core/services/auth.service';
import { LogService } from '@core/services/log.service';
import { UserService } from '@core/services/user.service';
import { FileService } from '@core/services/file.service';
import { ChartDataPoint } from '@core/models/api.models';

@Component({
    selector: 'app-home',
    imports: [
    MatCardModule,
    MatIconModule,
    TranslateModule,
    NgxChartsModule
],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public username = '';
  public totalUsers = 0;
  public totalFiles = 0;
  public accessToday = 0;
  public failedToday = 0;
  public chartData: ChartDataPoint[] = [];
  public chartSeries: {name: string; series: {name: string; value: number}[]}[] = [];
  public colorScheme = 'cool';

  public constructor(
    private authService: AuthService,
    private logService: LogService,
    private userService: UserService,
    private fileService: FileService,
  ) {}

  public ngOnInit(): void {
    this.username = this.authService.currentUser?.username ?? '';
    this.loadStats();
    this.loadChart();
  }

  private loadStats(): void {
    this.userService.getUsers(1, 1).subscribe({
      next: (res) => (this.totalUsers = res.meta.total),
    });

    this.fileService.getFiles(1, 1).subscribe({
      next: (res) => (this.totalFiles = res.meta.total),
    });

    // Use chart data to calculate today's stats
    this.logService.getChartData(1).subscribe({
      next: (res) => {
        if (res.success && res.data.length > 0) {
          const today = res.data[res.data.length - 1];
          this.accessToday = today.total;
          this.failedToday = today.failed;
        }
      },
    });
  }

  private loadChart(): void {
    this.logService.getChartData(30).subscribe({
      next: (res) => {
        if (res.success) {
          this.chartData = res.data;
          this.chartSeries = this.transformChartData(res.data);
        }
      },
    });
  }

  private transformChartData(data: ChartDataPoint[]): {name: string; series: {name: string; value: number}[]}[] {
    return [
      {
        name: 'Total Access',
        series: data.map((d) => ({ name: d.date, value: d.total })),
      },
      {
        name: 'Failed Attempts',
        series: data.map((d) => ({ name: d.date, value: d.failed })),
      },
    ];
  }
}
