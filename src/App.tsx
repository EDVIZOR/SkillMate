import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import VerifyOTP from './pages/VerifyOTP/VerifyOTP';
import Roadmaps from './pages/Roadmaps/Roadmaps';
import Chatbot from './pages/Chatbot/Chatbot';
import GlobalCommandBar from './components/GlobalCommandBar/GlobalCommandBar';
import AIResponseDisplay from './components/AIResponseDisplay/AIResponseDisplay';
import { sendCommandToAI, isRouteSafe } from './services/aiCommandService';
import { classifyIntent, getIntentDescription } from './services/intentUnderstanding';
import { routeIntentToAction, ActionType, getActionDescription } from './services/actionRouter';
import { executeAction, ExecutionResult } from './services/actionExecutor';

/**
 * Handle AI command using complete pipeline:
 * 1. Classifies user intent using AI
 * 2. Routes intent to appropriate system action
 * 3. Executes action safely (navigation, AI responses, etc.)
 */
const handleAICommand = async (
  command: string,
  navigate: (path: string) => void,
  setExecutionResult: (result: ExecutionResult | null) => void
) => {
  try {
    // Step 1: Classify user intent using AI
    const intentResponse = await classifyIntent(command);
    
    // Log intent classification for debugging
    console.log('Intent Classification Result:', {
      input: command,
      intent: intentResponse.intent,
      description: getIntentDescription(intentResponse.intent),
      confidence: intentResponse.confidence,
      topic: intentResponse.topic,
      domain: intentResponse.domain,
      context: intentResponse.context
    });
    
    // Step 2: Route intent to appropriate system action
    const actionDecision = routeIntentToAction(intentResponse);
    
    // Log action decision for debugging
    console.log('Action Decision:', {
      action: actionDecision.action,
      description: getActionDescription(actionDecision.action),
      payload: actionDecision.payload,
      messageHint: actionDecision.messageHint,
      confidence: actionDecision.confidence,
      requiresConfirmation: actionDecision.requiresConfirmation
    });
    
    // Step 3: Execute action safely
    const executionResult = await executeAction(actionDecision);
    
    // Log execution result
    console.log('Execution Result:', executionResult);
    
    // Handle execution result
    if (executionResult.success) {
      // Handle navigation
      if (executionResult.type === 'navigation' && executionResult.route) {
        navigate(executionResult.route);
      }
      
      // Show message/question to user
      if (executionResult.type === 'message' || executionResult.type === 'question') {
        setExecutionResult(executionResult);
      }
    } else {
      // Show error message
      setExecutionResult({
        success: false,
        type: 'message',
        message: executionResult.error || 'Something went wrong. Please try again.',
        error: executionResult.error
      });
    }
    
    return executionResult;
    
  } catch (error) {
    console.error('Error processing AI command:', error);
    
    // Show error to user
    setExecutionResult({
      success: false,
      type: 'message',
      message: 'I encountered an error. Please try again or rephrase your question.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// App Content Component (needs access to router hooks)
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  
  // Don't show command bar on auth pages
  const showCommandBar = !['/login', '/signup', '/verify-otp'].includes(location.pathname);
  
  const handleCommand = async (command: string) => {
    try {
      // Try new AI command service for natural language navigation
      const aiResponse = await sendCommandToAI(command);
      
      // If service is available and returned a response
      if (aiResponse) {
        if (aiResponse.action === 'REDIRECT' && aiResponse.route) {
          // Validate route is safe before navigating
          if (isRouteSafe(aiResponse.route)) {
            navigate(aiResponse.route);
            return; // Success, exit early
          } else {
            // Show error if route is not safe
            setExecutionResult({
              success: false,
              type: 'message',
              message: 'Invalid navigation target. Please use the menu to navigate.',
              error: 'Unsafe route attempted'
            });
            return;
          }
        } else if (aiResponse.action === 'ASK_CLARIFICATION' && aiResponse.message) {
          // Show clarification message
          setExecutionResult({
            success: true,
            type: 'message',
            message: aiResponse.message
          });
          return;
        }
      }
      
      // If service is unavailable (aiResponse is null) or didn't handle the command,
      // fallback to original AI pipeline for complex commands
      await handleAICommand(command, navigate, setExecutionResult);
    } catch (error) {
      console.error('Error handling command:', error);
      // Fallback to original AI pipeline
      await handleAICommand(command, navigate, setExecutionResult);
    }
  };
  
  const handleCloseResponse = () => {
    setExecutionResult(null);
  };
  
  const handleOptionSelect = async (option: string) => {
    // When user selects an option, process it as a new command
    setExecutionResult(null);
    await handleCommand(option);
  };
  
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/roadmaps" element={<Roadmaps />} />
        <Route path="/chatbot" element={<Chatbot />} />
      </Routes>
      {showCommandBar && <GlobalCommandBar onCommand={handleCommand} />}
      {executionResult && (
        <AIResponseDisplay
          message={executionResult.message}
          question={executionResult.question}
          options={executionResult.options}
          type={executionResult.type}
          onClose={handleCloseResponse}
          onOptionSelect={handleOptionSelect}
        />
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;

