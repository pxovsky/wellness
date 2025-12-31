import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => (
  <div className="mb-4 xl:mb-6">
    <h2 className="text-2xl xl:text-3xl font-bold text-white">{title}</h2>
    {subtitle && (
      <p className="text-sm xl:text-base text-gray-400 mt-1">{subtitle}</p>
    )}
  </div>
);
