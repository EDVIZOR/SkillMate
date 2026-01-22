import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Sparkles, Send, X, Loader2 } from 'lucide-react';
import './GlobalCommandBar.css';

interface GlobalCommandBarProps {
  onCommand?: (command: string) => Promise<void> | void;
}

const GlobalCommandBar: React.FC<GlobalCommandBarProps> = ({ onCommand }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setInput(e.target.value);
    if (e.target.value.length > 0 && !isExpanded) {
      setIsExpanded(true);
    }
  };

  // Handle command submission
  const handleSubmit = async () => {
    const command = input.trim();
    if (!command || isProcessing) return;

    setIsProcessing(true);
    
    try {
      // Call the command handler (which will use intent understanding)
      if (onCommand) {
        await onCommand(command);
      } else {
        // Default placeholder behavior
        console.log('AI Command received:', command);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For now, just show a friendly message
        alert(`I heard you say: "${command}". This feature is coming soon! 🚀`);
      }
    } catch (error) {
      console.error('Error handling command:', error);
      // Could show error message to user here
    } finally {
      setInput('');
      setIsProcessing(false);
      setIsExpanded(false);
      inputRef.current?.blur();
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setInput('');
      setIsExpanded(false);
      inputRef.current?.blur();
    }
  };

  // Handle focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setIsFocused(true);
    setIsExpanded(true);
    // Ensure input is focused and can receive input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle blur - delay to allow button clicks to register
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Don't blur if clicking inside the container
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (containerRef.current && containerRef.current.contains(relatedTarget)) {
      return;
    }
    
    // Delay blur to allow button clicks
    setTimeout(() => {
      setIsFocused(false);
      if (input.length === 0) {
        setIsExpanded(false);
      }
    }, 150);
  };

  // Close expanded view
  const handleClose = () => {
    setInput('');
    setIsExpanded(false);
    inputRef.current?.blur();
  };

  // Click outside to close (only when expanded and input is empty)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking on the input or container
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Only close if input is empty and not focused
        if (input.length === 0 && !isFocused) {
          setIsExpanded(false);
        }
      }
    };

    // Only add listener when expanded to avoid blocking interactions
    if (isExpanded) {
      // Use a small delay to allow input focus to register first
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }

    return () => {};
  }, [isExpanded, input.length, isFocused]);

  // Handle container click to focus input
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only focus if clicking on the container itself, not on child elements
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('command-bar-container')) {
      inputRef.current?.focus();
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`global-command-bar ${isExpanded ? 'expanded' : ''} ${isFocused ? 'focused' : ''} ${isProcessing ? 'processing' : ''}`}
      style={{ pointerEvents: 'auto' }}
      onClick={handleContainerClick}
    >
      <div 
        className="command-bar-container" 
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => {
          // Focus input when clicking container
          if (!isFocused && inputRef.current) {
            inputRef.current.focus();
          }
        }}
      >
        <div className="command-bar-content" style={{ pointerEvents: 'auto' }}>
          <div className="command-bar-icon">
            <Sparkles className="icon" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClick={(e) => {
              e.stopPropagation();
              if (inputRef.current && !isFocused) {
                inputRef.current.focus();
              }
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            placeholder="🧠 Ask anything or tell me what you want to do…"
            className="command-bar-input"
            disabled={isProcessing}
            readOnly={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            tabIndex={0}
            style={{ 
              pointerEvents: 'auto', 
              cursor: isProcessing ? 'not-allowed' : 'text',
              WebkitUserSelect: 'text',
              userSelect: 'text'
            }}
            aria-label="AI Command Bar - Ask anything or tell me what you want to do"
          />

          {isExpanded && (
            <div className="command-bar-actions">
              {input.trim() && (
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="command-bar-send-button"
                  type="button"
                  aria-label="Send command"
                >
                  {isProcessing ? (
                    <Loader2 className="icon spinning" />
                  ) : (
                    <Send className="icon" />
                  )}
                </button>
              )}
              <button
                onClick={handleClose}
                className="command-bar-close-button"
                type="button"
                aria-label="Close command bar"
              >
                <X className="icon" />
              </button>
            </div>
          )}
        </div>

        {/* Expanded helper text */}
        {isExpanded && (
          <div className="command-bar-helper">
            <p className="helper-text">
              Try: "I don't understand AI" • "Which domain should I choose?" • "Start aptitude test" • "I am confused"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalCommandBar;

