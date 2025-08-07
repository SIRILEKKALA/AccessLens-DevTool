// utils/ocr.ts
import Tesseract, { RecognizeResult, Word as TesseractWord } from 'tesseract.js';

interface Word extends TesseractWord {
  text: string;
  confidence: number;
}

export async function performOCR(file: File): Promise<string> {
  const result: RecognizeResult = await Tesseract.recognize(file, 'eng', {
    logger: (m) => console.log(m),
  });

  const words: Word[] = Array.isArray((result.data as { words?: Word[] }).words)
    ? ((result.data as { words?: Word[] }).words as Word[])
    : [];

  const filteredText = words
    .filter((word) => word.confidence >= 70 && word.text.trim() !== '')
    .map((word) => word.text)
    .join(' ');

  return filteredText.length > 0 ? filteredText : result.data.text;
}





