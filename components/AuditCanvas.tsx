// components/AuditCanvas.tsx

import { useEffect, useRef } from 'react';
import Tesseract, { Word } from 'tesseract.js';

interface AuditCanvasProps {
  imageUrl: string;
}

type OCRResult = {
  data: {
    words: Word[];
  };
};

const AuditCanvas: React.FC<AuditCanvasProps> = ({ imageUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const runAudit = async () => {
      if (!canvasRef.current || !imageUrl) return;

      const image = new Image();
      image.src = imageUrl;

      image.onload = async () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);

        const { data } = await Tesseract.recognize(imageUrl, 'eng');
        const words: Word[] = (data as unknown as OCRResult).data.words;

        for (const word of words) {
          const { x0, y0, x1, y1 } = word.bbox;

          // Simple contrast check (not actual contrast ratio)
          const width = x1 - x0;
          const height = y1 - y0;
          const imageData = ctx.getImageData(x0, y0, width, height).data;

          let totalBrightness = 0;
          for (let i = 0; i < imageData.length; i += 4) {
            const [r, g, b] = [imageData[i], imageData[i + 1], imageData[i + 2]];
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            totalBrightness += brightness;
          }

          const avgBrightness = totalBrightness / (imageData.length / 4);
          const isLowContrast = avgBrightness > 120; // adjust threshold as needed

          ctx.strokeStyle = isLowContrast ? 'red' : 'green';
          ctx.lineWidth = 2;
          ctx.strokeRect(x0, y0, width, height);
        }
      };
    };

    runAudit();
  }, [imageUrl]);

  return <canvas ref={canvasRef} className="w-full border rounded" />;
};

export default AuditCanvas;
