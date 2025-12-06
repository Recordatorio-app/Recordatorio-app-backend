export const DEFAULT_PALETTE = {
  urgente: "#FF4D4F",
  importante: "#FA8C16",
  normal: "#1890FF",
  baja: "#52C41A",
  personal: "#722ED1",
  otro: "#BFBFBF",
};

export const COLOR_KEYS = [
  "urgente",
  "importante",
  "normal",
  "baja",
  "personal",
  "otro",
] as const;
export type ColorKey = (typeof COLOR_KEYS)[number];
