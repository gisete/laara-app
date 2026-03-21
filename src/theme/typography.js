import { Platform } from 'react-native';

// ─── Font family tokens ───────────────────────────────────────────────────────
// Change these two values to retheme all typography across the app.

export const fonts = {
  heading: {
    regular:    'Heading-Regular',
    medium:     'Heading-Medium',
    semiBold:   'Heading-SemiBold',
    bold:       'Heading-Bold',
    italic:     'Heading-Italic',
    boldItalic: 'Heading-BoldItalic',
  },
  body: {
    regular: Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif' }),
    medium:  Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif-medium' }),
  },
};

// ─── Typographic scale ────────────────────────────────────────────────────────

export const typography = {
  headingLarge: {
    fontFamily: fonts.heading.medium,
    fontSize: 48,
    lineHeight: 56,
  },
  headingMedium: {
    fontFamily: fonts.heading.medium,
    fontSize: 32,
    lineHeight: 40,
  },
  headingSmall: {
    fontFamily: fonts.heading.medium,
    fontSize: 20,
    lineHeight: 28,
  },
  headingItalic: {
    fontFamily: fonts.heading.italic,
  },
  bodyLarge: {
    fontFamily: fonts.body.regular,
    fontSize: 17,
    lineHeight: 26,
  },
  bodyMedium: {
    fontFamily: fonts.body.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    fontFamily: fonts.body.regular,
    fontSize: 16,
    fontWeight: '500',
  },
  label: {
    fontFamily: fonts.body.medium,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    lineHeight: 16,
  },
};
