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

export const groupColors = [
  '#0381FE',
  '#FF8A3D',
  '#27AE60',
  '#9B59F6',
  '#00BCD4',
  '#E84A7F',
  '#E74C3C',
  '#34495E',
] as const;

export function oneColors(scheme: 'light' | 'dark' | null | undefined) {
  return scheme === 'dark' ? one.dark : one.light;
}

export function accentFor(index: number): string {
  return oneAccents[Math.abs(index) % oneAccents.length];
}

export function groupColorFor(index: number): string {
  return groupColors[Math.abs(index) % groupColors.length];
}

export function nextGroupColor(used: Array<string | null | undefined>): string {
  const taken = new Set(
    used.filter((color): color is string => Boolean(color)).map((color) => color.toUpperCase()),
  );
  return groupColors.find((color) => !taken.has(color.toUpperCase())) ?? groupColorFor(used.length);
}

export function normalizeGroupColor(color: string | null | undefined, fallbackIndex = 0): string {
  if (color && /^#[0-9A-Fa-f]{6}$/.test(color)) return color;
  return groupColorFor(fallbackIndex);
}

function channel(value: number): number {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

export function isDarkColor(hex: string): boolean {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) return true;
  const r = channel(Number.parseInt(raw.slice(0, 2), 16));
  const g = channel(Number.parseInt(raw.slice(2, 4), 16));
  const b = channel(Number.parseInt(raw.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.52;
}

export function inkOn(background: string) {
  const dark = isDarkColor(background);
  return {
    fg: dark ? '#FCFCFC' : '#252525',
    muted: dark ? 'rgba(252,252,252,0.74)' : 'rgba(37,37,37,0.64)',
    track: dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.14)',
    fill: dark ? '#FFFFFF' : '#252525',
    success: dark ? '#B8F5C8' : '#1BA954',
  };
}
