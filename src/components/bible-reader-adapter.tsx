
import React, { useState } from 'react';
import { BibleReader } from '@/components/BibleReader';

interface BibleReaderAdapterProps {
  onProgressUpdate?: (book?: string, chapter?: number) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export const BibleReaderAdapter: React.FC<BibleReaderAdapterProps> = ({ 
  onProgressUpdate, 
  onLoadingChange 
}) => {
  const handleProgressUpdate = (book?: string, chapter?: number) => {
    if (onProgressUpdate) {
      onProgressUpdate(book, chapter);
    }
  };

  const [loading, setLoading] = useState(false);
  
  const handleLoadingChange = (isLoading: boolean) => {
    setLoading(isLoading);
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }
  };

  return (
    <div className="w-full">
      {loading && (
        <div className="w-full py-4 text-center text-muted-foreground">
          Loading scripture...
        </div>
      )}
      <BibleReader 
        onProgressUpdate={() => handleProgressUpdate()}
        onLoading={handleLoadingChange}  
      />
    </div>
  );
};
