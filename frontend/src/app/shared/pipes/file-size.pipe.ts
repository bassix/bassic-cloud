import { Pipe, PipeTransform } from '@angular/core';

/**
 * Converts byte values to human-readable file sizes.
 * Usage: {{ file.size | fileSize }}
 */
@Pipe({ name: 'fileSize', standalone: true })
export class FileSizePipe implements PipeTransform {
  private readonly units = ['B', 'KB', 'MB', 'GB', 'TB'];

  public transform(bytes: string | number): string {
    const size = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;

    if (isNaN(size) || size === 0) {
      return '0 B';
    }

    const unitIndex = Math.floor(Math.log(size) / Math.log(1024));
    const clampedIndex = Math.min(unitIndex, this.units.length - 1);
    const readableSize = size / Math.pow(1024, clampedIndex);

    return `${readableSize.toFixed(clampedIndex > 0 ? 1 : 0)} ${this.units[clampedIndex]}`;
  }
}
