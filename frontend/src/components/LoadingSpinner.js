import React from 'react';

export const LoadingSpinner = ({ size = 'default', text = 'Đang tải...' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}></div>
      {text && <p className="mt-2 text-gray-600">{text}</p>}
    </div>
  );
};

export const LoadingOverlay = ({ text = 'Đang xử lý...' }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <LoadingSpinner text={text} />
      </div>
    </div>
  );
};

export const LoadingPage = ({ text = 'Đang tải dữ liệu...' }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-4 bg-white rounded-lg shadow-lg">
          <LoadingSpinner size="large" text={text} />
        </div>
      </div>
    </div>
  );
};

export const LoadingSkeleton = ({ rows = 5 }) => {
  return (
    <div className="animate-pulse">
      {[...Array(rows)].map((_, index) => (
        <div key={index} className="border-b border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-gray-300 h-10 w-10"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="h-4 bg-gray-300 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;