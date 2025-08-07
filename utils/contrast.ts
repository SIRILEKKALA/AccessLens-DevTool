// utils/contrast.ts (unchanged)

export const getContrast = (imageData: ImageData): number => {
  const data = imageData.data;
  let totalLuminance = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;

    const [rl, gl, bl] = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    const luminance = 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
    totalLuminance += luminance;
  }

  const averageLuminance = totalLuminance / pixelCount;
  const contrastRatio = (1.05) / (averageLuminance + 0.05);

  return parseFloat(contrastRatio.toFixed(2));
};