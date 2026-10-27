import { FaClock, FaCheckCircle, FaShippingFast, FaBox } from 'react-icons/fa';

const OrderProgress = ({ status }) => {
  const steps = [
    { key: 'pending', label: 'Pending', description: 'Order Placed' },
    { key: 'approved', label: 'Approved', description: 'Confirmed' },
    { key: 'intransit', label: 'In Transit', description: 'On the Way' },
    { key: 'delivered', label: 'Delivered', description: 'Completed' },
  ];

  const currentIndex = steps.findIndex((step) => step.key === status);
  const progressPercentage = ((currentIndex + 1) / steps.length) * 100;

  const getIcon = (step) => {
    switch (step) {
      case 'pending':
        return <FaClock className="text-lg" />;
      case 'approved':
        return <FaCheckCircle className="text-lg" />;
      case 'intransit':
        return <FaShippingFast className="text-lg" />;
      case 'delivered':
        return <FaBox className="text-lg" />;
      default:
        return null;
    }
  };

  const getStatusColor = (step) => {
    switch (step) {
      case 'pending':
        return 'bg-orange-500';
      case 'approved':
        return 'bg-blue-500';
      case 'intransit':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="mt-6 px-4 py-6 bg-gray-50 rounded-lg">
      <h4 className="text-lg font-semibold mb-6">Order Progress</h4>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <div className="w-full primaryBgColor rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercentage}%`,
                  backgroundColor: getStatusColor(status),
                }}
              />
            </div>
          </div>
          <span className="ml-3 text-xs font-semibold text-gray-600">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="flex justify-between items-start gap-2 md:gap-0">
        {steps.map((step, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? `${getStatusColor(step.key)} accentTextColor shadow-lg`
                    : 'bg-gray-300 text-gray-500'
                }`}
              >
                {getIcon(step.key)}
              </div>

              {/* Step Label */}
              <p
                className={`mt-2 text-xs md:text-sm font-semibold capitalize transition-colors duration-300 text-center ${
                  isActive ? 'secondaryTextColor' : 'text-gray-400'
                }`}
              >
                {step.label}
              </p>

              {/* Step Description */}
              <p
                className={`text-xs text-center transition-colors duration-300 mt-1 ${
                  isCurrent ? 'font-semibold' : ''
                } ${isActive ? 'text-gray-600' : 'text-gray-400'}`}
              >
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Current Status Message */}
      {currentIndex >= 0 && (
        <div
          className="mt-6 p-3 bg-white rounded-lg border-l-4"
          style={{
            borderLeftColor:
              getStatusColor(status).replace('bg-', '#').split('-')[0] ||
              '#666',
          }}
        >
          <p className="text-sm">
            <span className="font-semibold">Current Status: </span>
            <span className="capitalize">{steps[currentIndex].label}</span>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Your order is {steps[currentIndex].description.toLowerCase()}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderProgress;
