'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type Step = {
  id: string | number;
  label: string;
  description?: string;
};

type StepperProps = {
  steps: Step[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  className?: string;
  stepClassName?: string;
  activeStepClassName?: string;
  completedStepClassName?: string;
  disabledStepClassName?: string;
  connectorClassName?: string;
};

export function Stepper({
  steps,
  currentStep,
  setCurrentStep,
  className,
  stepClassName,
  activeStepClassName,
  completedStepClassName,
  disabledStepClassName,
  connectorClassName,
}: StepperProps) {
  return (
    <div className={cn('w-full items-start justify-between hidden sm:flex gap-1', className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isDisabled = index > currentStep;

        return (
          <React.Fragment key={step.id}>
            {index > 0 && (
              <div
                className={cn(
                  'h-[2px] flex-1 bg-gray-200 mt-4 scale-x-[200] transform',
                  isCompleted && 'bg-primary',
                  connectorClassName,
                )}
              />
            )}
            <div
              onClick={() => !isDisabled && setCurrentStep(index)}
              className={cn(
                'flex flex-col items-center',
                !isDisabled && 'cursor-pointer',
                stepClassName,
              )}>
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200 text-sm font-medium',
                  isActive && 'border-primary bg-primary text-white animate-bounce',
                  isCompleted && 'border-primary bg-primary text-white',
                  isDisabled && 'border-gray-200 text-gray-400 animate-pulse',
                  activeStepClassName,
                  completedStepClassName,
                  disabledStepClassName,
                )}>
                {isCompleted ? <CheckIcon className="h-4 w-4" /> : index + 1}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isActive && 'text-primary',
                    isCompleted && 'text-primary',
                    isDisabled && 'text-gray-400',
                  )}>
                  {step.label}
                </p>
                {step.description && (
                  <p
                    className={cn(
                      'text-xs text-gray-500',
                      isActive && 'text-primary',
                      isCompleted && 'text-primary',
                    )}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
