
import React, { useState } from 'react';
import { BibleReader } from '@/components/BibleReader';
import { VerseLoading } from '@/components/ui/verse-loading';

interface BibleReaderAdapterProps {
  onProgressUpdate?: (book?: string, chapter?: number) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export const BibleReaderAdapter: React.FC<BibleReaderAdapterProps> = ({ 
  onProgressUpdate, 
  onLoadingChange 
}) => {
  const [loading, setLoading] = useState(false);
  
  const handleProgressUpdate = (book?: string, chapter?: number) => {
    if (onProgressUpdate) {
      onProgressUpdate(book, chapter);
    }
  };
  
  const handleLoadingChange = (isLoading: boolean) => {
    setLoading(isLoading);
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }
  };

  return (
    <div className="w-full">
      {loading && <VerseLoading message="Loading scripture..." />}
      <BibleReader 
        onProgressUpdate={handleProgressUpdate}
        onLoading={handleLoadingChange}  
      />
    </div>
  );
};
