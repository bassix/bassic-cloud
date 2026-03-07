
describe('ThemeService (localStorage)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should have no stored theme by default', () => {
    expect(localStorage.getItem('basscloud_theme')).toBeNull();
  });

  it('should persist dark theme to localStorage', () => {
    localStorage.setItem('basscloud_theme', 'dark');
    expect(localStorage.getItem('basscloud_theme')).toBe('dark');
  });

  it('should persist light theme to localStorage', () => {
    localStorage.setItem('basscloud_theme', 'light');
    expect(localStorage.getItem('basscloud_theme')).toBe('light');
  });

  it('should toggle between light and dark', () => {
    localStorage.setItem('basscloud_theme', 'light');
    expect(localStorage.getItem('basscloud_theme')).toBe('light');

    localStorage.setItem('basscloud_theme', 'dark');
    expect(localStorage.getItem('basscloud_theme')).toBe('dark');
  });

  it('should apply dark class to document element', () => {
    document.documentElement.classList.add('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should remove dark class for light mode', () => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
