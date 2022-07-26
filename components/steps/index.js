import { CheckIcon } from '@heroicons/react/solid'
import { useState, useEffect } from 'react'

const steps = [
  { id: 1, name: 'Pre-send', status: 'complete' },
  { id: 2, name: 'Full Send', status: 'current' },
  { id: 3, name: 'Done', status: 'upcoming' },
]

const Steps = ({ currentStep }) => {
  const [allSteps, setAllSteps] = useState(steps)

  useEffect(() => {
    if (currentStep === 1) {
      setAllSteps([
        { id: 1, name: 'Pre-send', status: 'current' },
        { id: 2, name: 'Full Send', status: 'upcoming' },
        { id: 3, name: 'Done', status: 'upcoming' },
      ])
    } else if (currentStep === 2) {
      setAllSteps([
        { id: 1, name: 'Pre-send', status: 'complete' },
        { id: 2, name: 'Full Send', status: 'current' },
        { id: 3, name: 'Done', status: 'upcoming' },
      ])
    } else if (currentStep === 3) {
      setAllSteps([
        { id: 1, name: 'Pre-send', status: 'complete' },
        { id: 2, name: 'Full Send', status: 'complete' },
        { id: 3, name: 'Done', status: 'complete' },
      ])
    }
  }, [currentStep])
  
  return (
    <nav aria-label="Progress" className='mb-6'>
      <ol role="list" className="border border-gray-300 rounded-md divide-y divide-gray-300 md:flex md:divide-y-0">
        {allSteps.map((step, stepIdx) => (
          <li key={step.name} className="relative md:flex-1 md:flex">
            {step.status === 'complete' ? (
              <p className="group flex items-center w-full">
                <span className="px-6 py-4 flex items-center text-sm font-medium">
                  <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-600 rounded-full">
                    <CheckIcon className="w-6 h-6 text-white" aria-hidden="true" />
                  </span>
                  <span className="ml-4 text-sm font-medium text-gray-900">{step.name}</span>
                </span>
              </p>
            ) : step.status === 'current' ? (
              <p className="px-6 py-4 flex items-center text-sm font-medium" aria-current="step">
                <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-blue-600 rounded-full">
                  <span className="text-blue-600">{step.id}</span>
                </span>
                <span className="ml-4 text-sm font-medium text-blue-600">{step.name}</span>
              </p>
            ) : (
              <p className="group flex items-center">
                <span className="px-6 py-4 flex items-center text-sm font-medium">
                  <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-full">
                    <span className="text-gray-500">{step.id}</span>
                  </span>
                  <span className="ml-4 text-sm font-medium text-gray-500">{step.name}</span>
                </span>
              </p>
            )}

            {stepIdx !== steps.length - 1 ? (
              <>
                {/* Arrow separator for lg screens and up */}
                <div className="hidden md:block absolute top-0 right-0 h-full w-5" aria-hidden="true">
                  <svg
                    className="h-full w-full text-gray-300"
                    viewBox="0 0 22 80"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 -2L20 40L0 82"
                      vectorEffect="non-scaling-stroke"
                      stroke="currentcolor"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Steps