import React from 'react';

const StepIndicator = ({ steps, currentStep }) => (
  <div className="flex items-center justify-center mb-6">
    {steps.map((step, idx) => (
      <div key={step} className="flex items-center">
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full font-bold
            ${idx + 1 === currentStep ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}
          `}
        >
          {idx + 1}
        </div>
        {idx < steps.length - 1 && (
          <div className="w-10 h-1 bg-gray-300 mx-2 rounded"></div>
        )}
      </div>
    ))}
  </div>
);

export default StepIndicator;