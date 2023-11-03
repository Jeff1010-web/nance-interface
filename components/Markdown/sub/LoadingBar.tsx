import { useState } from 'react';

export const Loading = () => {
  const [imageUploading, setImageUploading] = useState(0);

  const simulateLoading = (fileSize: number) => {
    const time = Math.round(fileSize / (10 * 1000)) * 10;
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress > 100) {
        clearInterval(interval);
      } else {
        setImageUploading(progress);
      }
    }, time);
    return interval;
  };

  return {
    Component: () => (
      <div>
        <div aria-hidden="true">
          <div className="overflow-hidden rounded-full bg-white">
            <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${imageUploading}%` }} />
          </div>
        </div>
      </div>
    ),
    setImageUploading,
    simulateLoading
  };
};

export default Loading;