export const one = {
  light: {
    canvas: '#F6F6F6',
    surface: '#FFFFFF',
    fg: '#252525',
    muted: '#8C8C8C',
    blue: '#0381FE',
    blueDeep: '#0072DE',
    blueBright: '#3E91FF',
    control: '#3E91FF',
    danger: '#E73F3F',
    divider: '#EDEDED',
    success: '#1BA954',
  },
  dark: {
    canvas: '#010101',
    surface: '#2C2C2C',
    fg: '#FCFCFC',
    muted: '#9A9A9A',
    blue: '#0381FE',
    blueDeep: '#3E91FF',
    blueBright: '#3E91FF',
    control: '#3E91FF',
    danger: '#FF6B6B',
    divider: '#3D3D3D',
    success: '#2ECC71',
  },
} as const;

export const oneAccents = ['#0381FE', '#FF8A3D', '#27AE60', '#9B59F6', '#00BCD4', '#E84A7F'] as const;

export function oneColors(scheme: 'light' | 'dark' | null | undefined) {
  return scheme === 'dark' ? one.dark : one.light;
}

export function accentFor(index: number): string {
  return oneAccents[Math.abs(index) % oneAccents.length];
}
