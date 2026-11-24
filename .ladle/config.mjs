export default {
  stories: 'src/**/*.stories.tsx',
  port: 61000,
  addons: {
    theme: { enabled: true, defaultState: 'dark' },
    a11y: { enabled: true },
    width: { enabled: true, options: { phone: 390, tablet: 820, desktop: 1280 }, defaultState: 0 },
    rtl: { enabled: false },
    source: { enabled: true },
  },
};
