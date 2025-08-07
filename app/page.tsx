// app/page.tsx

'use client';

import { useState, useCallback } from 'react';
import UploadScreen from '../components/UploadScreen';
import { performOCR } from '../utils/ocr';
import { getContrast } from '../utils/contrast';
import NextImage from 'next/image';
import jsPDF from 'jspdf';

interface AuditResult {
  file: File;
  previewUrl: string;
  extractedText: string;
  contrast: number;
  status: 'Pass' | 'Fail';
}

export default function Home() {
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);

  const handleImagesUpload = useCallback(async (files: File[]) => {
    const results: AuditResult[] = [];

    for (const file of files) {
      const previewUrl = URL.createObjectURL(file);
      const img = document.createElement('img');
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.src = previewUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');

      let contrast = 0;
      let status: 'Pass' | 'Fail' = 'Fail';

      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        contrast = getContrast(imageData);
        status = contrast >= 4.5 ? 'Pass' : 'Fail';
      }

      const extractedText = await performOCR(file);

      results.push({ file, previewUrl, extractedText, contrast, status });
    }

    setAuditResults(results);
  }, []);

  const downloadPDF = (result: AuditResult, index: number) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Accessibility Audit Report', 14, 20);

    doc.setFontSize(12);
    doc.text(`File Name: ${result.file.name}`, 14, 40);
    doc.text(`Contrast Ratio: ${result.contrast}`, 14, 50);
    doc.text(`Status: ${result.status}`, 14, 60);

    doc.text('Extracted Text:', 14, 80);
    doc.setFontSize(10);
    doc.text(result.extractedText || 'No text detected', 14, 90, { maxWidth: 180 });

    doc.save(`Audit_Report_${index + 1}.pdf`);
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-5xl">
        <h1 className="text-3xl font-bold mb-6 text-center">AccessLens Batch Audit Dashboard</h1>
        <UploadScreen onImagesUpload={handleImagesUpload} />

        {auditResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {auditResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4 bg-white shadow-md">
                <NextImage src={result.previewUrl} alt={`Upload ${index + 1}`} width={500} height={300} className="w-full h-48 object-contain mb-4" unoptimized />
                <div>
                  <p className="text-sm text-gray-600">Contrast Ratio: <span className="font-bold">{result.contrast}</span></p>
                  <p>
                    Status: <span className={result.status === 'Pass' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                      {result.status}
                    </span>
                  </p>
                </div>
                <div className="mt-2">
                  <h3 className="text-sm font-semibold">Extracted Text:</h3>
                  <pre className="bg-gray-100 p-2 rounded text-xs whitespace-pre-wrap max-h-32 overflow-y-auto">{result.extractedText}</pre>
                </div>
                <button
                  onClick={() => downloadPDF(result, index)}
                  className="mt-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Download Report
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

