import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">M</span>
      </div>
      <h1 className="text-lg font-bold text-white">Myniu Lite</h1>
    </div>
  );
};
