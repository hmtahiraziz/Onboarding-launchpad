import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  steps?: number;
  currentStep?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className,
  showPercentage = false,
  size = 'md',
  steps,
  currentStep
}) => {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  // If steps are provided, render step indicators
  if (steps && currentStep !== undefined) {
    return (
      <div className={clsx('w-full', className)}>
        {/* Step Indicators */}
        <div className="flex items-center justify-center mb-4">
          {Array.from({ length: steps }, (_, index) => (
            <React.Fragment key={index}>
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                  index <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                )}
              >
                {index + 1}
              </div>
              {index < steps - 1 && (
                <div
                  className={clsx(
                    'w-8 h-1 mx-2 transition-all duration-300',
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Main Progress Bar */}
        <div className={clsx('w-full bg-gray-200 rounded-full overflow-hidden', sizeClasses[size])}>
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>

        {/* Percentage Text */}
        {showPercentage && (
          <div className="mt-2 text-sm text-gray-600 text-center font-medium">
            {Math.round(clampedProgress)}%
          </div>
        )}
      </div>
    );
  }

  // Default progress bar without steps
  return (
    <div className={clsx('w-full', className)}>
      <div className={clsx('w-full bg-gray-200 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className="h-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <div className="mt-2 text-sm text-gray-600 text-center font-medium">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
};
