
// components/UploadScreen.tsx

import { ChangeEvent } from 'react';

const UploadScreen = ({ onImagesUpload }: { onImagesUpload: (files: File[]) => void }) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onImagesUpload(files);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition"
      >
        Upload Images
      </label>
    </div>
  );
};

export default UploadScreen;

