import React from 'react';
import { RisingBallLoader } from '@/components/ui/rising-ball';

export const LoadingSkeleton = ({ lines = 3, className = '', text = 'Loading...' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 my-6 ${className}`}>
      <RisingBallLoader text={text} />
    </div>
  );
};

export default LoadingSkeleton;
