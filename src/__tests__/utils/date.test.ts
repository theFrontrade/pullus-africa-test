import { formatDate, formatDateTime } from '@/utils/date';

describe('formatDate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-08T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return "Just now" for dates less than a minute ago', () => {
    const date = new Date('2026-01-08T11:59:30.000Z').toISOString();
    expect(formatDate(date)).toBe('Just now');
  });

  it('should return minutes ago for dates less than an hour ago', () => {
    const date = new Date('2026-01-08T11:30:00.000Z').toISOString();
    expect(formatDate(date)).toBe('30m ago');
  });

  it('should return hours ago for dates less than a day ago', () => {
    const date = new Date('2026-01-08T06:00:00.000Z').toISOString();
    expect(formatDate(date)).toBe('6h ago');
  });

  it('should return days ago for dates less than a week ago', () => {
    const date = new Date('2026-01-05T12:00:00.000Z').toISOString();
    expect(formatDate(date)).toBe('3d ago');
  });

  it('should return formatted date for dates more than a week ago (same year)', () => {
    const date = new Date('2026-01-01T12:00:00.000Z').toISOString();
    expect(formatDate(date)).toBe('Jan 1');
  });

  it('should return formatted date for dates from previous year', () => {
    const date = new Date('2025-12-25T12:00:00.000Z').toISOString();
    expect(formatDate(date)).toBe('Dec 25, 2025');
  });

  it('should include year for dates from a different year', () => {
    const date = new Date('2024-12-25T12:00:00.000Z').toISOString();
    expect(formatDate(date)).toBe('Dec 25, 2024');
  });
});

describe('formatDateTime', () => {
  it('should return full date and time', () => {
    const date = new Date('2026-01-08T15:30:00.000Z').toISOString();
    const result = formatDateTime(date);
    expect(result).toContain('Jan');
    expect(result).toContain('8');
    expect(result).toContain('2026');
  });
});
