import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

const DetailedAnalysisView = ({ data, onClose }) => {
  if (!data) return null;
  
  const {
    title,
    type,
    details,
    timestamp,
    metrics = [],
    subtitle,
    itemData
  } = data;
  
  // Format the timestamp if it exists
  const formattedTime = timestamp ? (
    typeof timestamp === 'string' 
      ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
      : formatDistanceToNow(timestamp, { addSuffix: true })
  ) : '';

  // For bar charts, handle category data
  const renderItemDetails = () => {
    if (!itemData) return null;
    
    if (type === 'timeSeriesPoint') {
      return (
        <div className="mt-4">
          <h3 className="text-md font-medium mb-2">Time Point Details</h3>
          <div className="bg-gray-50 p-3 rounded">
            <p><span className="font-medium">Date:</span> {itemData.date}</p>
            <p><span className="font-medium">Count:</span> {itemData.count}</p>
            {itemData.additionalData && Object.entries(itemData.additionalData).map(([key, value]) => (
              <p key={key}><span className="font-medium">{key}:</span> {value}</p>
            ))}
          </div>
        </div>
      );
    }
    
    if (type === 'distributionBar') {
      return (
        <div className="mt-4">
          <h3 className="text-md font-medium mb-2">Score Range Details</h3>
          <div className="bg-gray-50 p-3 rounded">
            <p><span className="font-medium">Range:</span> {itemData.range}</p>
            <p><span className="font-medium">Count:</span> {itemData.count}</p>
            <p><span className="font-medium">Percentage:</span> {itemData.percentage}%</p>
          </div>
        </div>
      );
    }
    
    if (type === 'subjectLine') {
      return (
        <div className="mt-4">
          <h3 className="text-md font-medium mb-2">Subject Line Details</h3>
          <div className="bg-gray-50 p-3 rounded">
            <p><span className="font-medium">Subject:</span> {itemData.subjectLine}</p>
            <p><span className="font-medium">Overall Score:</span> {itemData.overallScore}</p>
            <p><span className="font-medium">Spam Score:</span> {itemData.spamScore}%</p>
            <p><span className="font-medium">Length:</span> {itemData.length} characters</p>
            {itemData.created && (
              <p><span className="font-medium">Created:</span> {formatDistanceToNow(new Date(itemData.created), { addSuffix: true })}</p>
            )}
          </div>
          
          {itemData.powerWords && itemData.powerWords.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-1">Power Words Used</h4>
              <div className="flex flex-wrap gap-1">
                {itemData.powerWords.map((word, idx) => (
                  <span key={idx} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {itemData.spamTriggers && itemData.spamTriggers.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-1">Spam Triggers</h4>
              <div className="flex flex-wrap gap-1">
                {itemData.spamTriggers.map((word, idx) => (
                  <span key={idx} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Generic fallback for other data types
    return (
      <div className="mt-4">
        <h3 className="text-md font-medium mb-2">Details</h3>
        <div className="bg-gray-50 p-3 rounded">
          {Object.entries(itemData).map(([key, value]) => {
            // Skip rendering arrays and objects directly
            if (typeof value === 'object' && value !== null) return null;
            return (
              <p key={key}><span className="font-medium">{key}:</span> {value}</p>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
              {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
              {formattedTime && <p className="text-sm text-gray-500 mt-1">{formattedTime}</p>}
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {details && <p className="mt-3 text-gray-700">{details}</p>}
          
          {metrics && metrics.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
              {metrics.map((metric, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">{metric.label}</p>
                  <p className="text-lg font-semibold">{metric.value}</p>
                </div>
              ))}
            </div>
          )}
          
          {renderItemDetails()}
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalysisView;
