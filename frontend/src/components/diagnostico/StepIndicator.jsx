import React from 'react';
import { Check } from 'lucide-react';

const StepIndicator = ({ currentStep, totalSteps, onStepClick, completedSteps = [] }) => {
  const stepNames = [
    'Contacto',
    'Contexto',
    'Madurez',
    'Gobernanza',
    'Datos',
    'Necesidades',
  ];

  const handleStepClick = (stepNumber) => {
    // Solo permitir navegar a pasos completados o el paso actual
    if (stepNumber < currentStep && onStepClick) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div data-testid="step-indicator" className="mb-8">
      {/* Progress bar */}
      <div className="relative">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200">
          <div
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#4CAF50] transition-all duration-500"
          />
        </div>
      </div>

      {/* Step labels */}
      <div className="flex justify-between items-center">
        {stepNames.map((name, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isClickable = stepNumber < currentStep;

          return (
            <div
              key={index}
              className={`flex flex-col items-center ${isClickable ? 'cursor-pointer' : ''}`}
              data-testid={`step-${stepNumber}`}
              onClick={() => handleStepClick(stepNumber)}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? 'bg-[#4CAF50] border-[#4CAF50] text-white hover:bg-[#45a049]'
                    : isCurrent
                    ? 'bg-white border-[#4CAF50] text-[#4CAF50]'
                    : 'bg-white border-gray-300 text-gray-400'
                } ${isClickable ? 'hover:shadow-md' : ''}`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="font-semibold">{stepNumber}</span>
                )}
              </div>
              <span
                className={`text-xs mt-2 hidden sm:block ${
                  isCurrent ? 'font-semibold text-[#2D5F3F]' : 'text-gray-500'
                } ${isClickable ? 'hover:text-[#2D5F3F]' : ''}`}
              >
                {name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;