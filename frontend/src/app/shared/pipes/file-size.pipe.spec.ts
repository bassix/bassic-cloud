import { FileSizePipe } from './file-size.pipe';

describe('FileSizePipe', () => {
  let pipe: FileSizePipe;

  beforeEach(() => {
    pipe = new FileSizePipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "0 B" for zero', () => {
    expect(pipe.transform(0)).toBe('0 B');
    expect(pipe.transform('0')).toBe('0 B');
  });

  it('should return "0 B" for NaN', () => {
    expect(pipe.transform('not-a-number')).toBe('0 B');
  });

  it('should format bytes', () => {
    expect(pipe.transform(500)).toBe('500 B');
  });

  it('should format kilobytes', () => {
    expect(pipe.transform(1024)).toBe('1.0 KB');
    expect(pipe.transform(2048)).toBe('2.0 KB');
  });

  it('should format megabytes', () => {
    expect(pipe.transform(1048576)).toBe('1.0 MB');
  });

  it('should format gigabytes', () => {
    expect(pipe.transform(1073741824)).toBe('1.0 GB');
  });

  it('should accept string input', () => {
    expect(pipe.transform('2048')).toBe('2.0 KB');
  });
});
