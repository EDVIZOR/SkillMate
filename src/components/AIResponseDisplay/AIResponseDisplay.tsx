import React, { useEffect } from 'react';
import { X, Sparkles, HelpCircle, Heart, BookOpen } from 'lucide-react';
import './AIResponseDisplay.css';

interface AIResponseDisplayProps {
  message?: string;
  question?: string;
  options?: string[];
  type: 'message' | 'question' | 'no_action';
  onClose: () => void;
  onOptionSelect?: (option: string) => void;
}

const AIResponseDisplay: React.FC<AIResponseDisplayProps> = ({
  message,
  question,
  options,
  type,
  onClose,
  onOptionSelect
}) => {
  useEffect(() => {
    // Auto-close after 10 seconds for messages
    if (type === 'message' && message) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [type, message, onClose]);

  if (type === 'no_action' || (!message && !question)) {
    return null;
  }

  const getIcon = () => {
    switch (type) {
      case 'question':
        return <HelpCircle className="icon" />;
      case 'message':
      default:
        return <Sparkles className="icon" />;
    }
  };

  return (
    <div className="ai-response-display">
      <div className="ai-response-container">
        <div className="ai-response-header">
          <div className="ai-response-icon">
            {getIcon()}
          </div>
          <button
            onClick={onClose}
            className="ai-response-close"
            type="button"
            aria-label="Close"
          >
            <X className="icon" />
          </button>
        </div>
        
        <div className="ai-response-content">
          {message && (
            <div className="ai-response-message">
              <p>{message}</p>
            </div>
          )}
          
          {question && (
            <div className="ai-response-question">
              <p className="question-text">{question}</p>
              {options && options.length > 0 && (
                <div className="question-options">
                  {options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (onOptionSelect) {
                          onOptionSelect(option);
                        }
                        onClose();
                      }}
                      className="option-button"
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIResponseDisplay;

