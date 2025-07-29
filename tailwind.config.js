/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // This is the crucial part that was missing.
      // It tells Tailwind to use our CSS variables for its color classes.
      colors: {
        primary: 'var(--color-primary)',
        onPrimary: 'var(--color-onPrimary)',
        primaryContainer: 'var(--color-primaryContainer)',
        onPrimaryContainer: 'var(--color-onPrimaryContainer)',
        secondary: 'var(--color-secondary)',
        onSecondary: 'var(--color-onSecondary)',
        secondaryContainer: 'var(--color-secondaryContainer)',
        onSecondaryContainer: 'var(--color-onSecondaryContainer)',
        tertiary: 'var(--color-tertiary)',
        onTertiary: 'var(--color-onTertiary)',
        tertiaryContainer: 'var(--color-tertiaryContainer)',
        onTertiaryContainer: 'var(--color-onTertiaryContainer)',
        error: 'var(--color-error)',
        onError: 'var(--color-onError)',
        errorContainer: 'var(--color-errorContainer)',
        onErrorContainer: 'var(--color-onErrorContainer)',
        background: 'var(--color-background)',
        onBackground: 'var(--color-onBackground)',
        surface: 'var(--color-surface)',
        onSurface: 'var(--color-onSurface)',
        surfaceVariant: 'var(--color-surfaceVariant)',
        onSurfaceVariant: 'var(--color-onSurfaceVariant)',
        outline: 'var(--color-outline)',
        outlineVariant: 'var(--color-outlineVariant)',
        inverseSurface: 'var(--color-inverseSurface)',
        onInverseSurface: 'var(--color-onInverseSurface)',
        surfaceContainerLowest: 'var(--color-surfaceContainerLowest)',
        surfaceContainerLow: 'var(--color-surfaceContainerLow)',
        surfaceContainer: 'var(--color-surfaceContainer)',
        surfaceContainerHigh: 'var(--color-surfaceContainerHigh)',
        surfaceContainerHighest: 'var(--color-surfaceContainerHighest)',
      }
    },
  },
  plugins: [],
}
