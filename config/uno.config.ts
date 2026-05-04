import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      scale: 1.15,
      warn: true,
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    colors: {
      brand: {
        50: '#eef8ff',
        100: '#d9efff',
        500: '#1f8acb',
        600: '#0f73b2',
        700: '#0d5d91',
      },
    },
  },
  shortcuts: {
    toolbar: 'flex items-center justify-between gap-12px',
  },
})
