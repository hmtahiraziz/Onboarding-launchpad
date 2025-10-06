import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DynamicFormRenderer } from '../components/dynamic-form/DynamicFormRenderer';
import { questionnaireApi } from '@/data/api/questionnaireApi';

export const DynamicOnboardingPage: React.FC = () => {
  const [customerId] = useState('customer_' + Date.now()); // In real app, this would come from auth
  const [questionnaireId, setQuestionnaireId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = (responses: any[]) => {
    console.log('Form completed with responses:', responses);
    // Don't set isCompleted to true immediately - let the form handle product display
    // setIsCompleted(true);
  };

  const handleProgress = (step: number, progressPercentage: number) => {
    setCurrentStep(step);
    setProgress(progressPercentage);
  };

  useEffect(() => {
    const loadActiveQuestionnaire = async () => {
      try {
        console.log('🚀 Loading active questionnaire...');
        const activeQuestionnaire = await questionnaireApi.getFirstActiveQuestionnaire();
        
        if (activeQuestionnaire) {
          console.log('✅ Found active questionnaire:', activeQuestionnaire.id);
          setQuestionnaireId(activeQuestionnaire.id);
        } else {
          console.log('❌ No active questionnaire found');
          setError('No active questionnaire available. Please contact support.');
        }
      } catch (err) {
        console.error('❌ Failed to load active questionnaire:', err);
        setError('Failed to load questionnaire. Please try again later.');
      } finally {
        // Simulate loading and show welcome animation
        const timer = setTimeout(() => {
          setIsLoading(false);
          setTimeout(() => setShowWelcome(false), 2000);
        }, 1500);

        return () => clearTimeout(timer);
      }
    };

    loadActiveQuestionnaire();
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-primary-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Paramount Launchpad</h2>
          <p className="text-gray-600">Preparing your personalized onboarding experience...</p>
        </div>
      </div>
    );
  }

  // Welcome screen
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center px-4">
          <div className="animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-4 animate-slide-up">
              Welcome to Paramount Launchpad
            </h1>
            <p className="text-xl text-gray-600 mb-8 animate-slide-up-delay">
              Let's create your personalized liquor wholesale experience in just a few minutes
            </p>
            <div className="space-y-4 animate-slide-up-delay-2">
              <div className="flex items-center justify-center space-x-2 text-primary-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>AI-powered product recommendations</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-primary-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Personalized for your business</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-primary-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Access to 19,000+ products</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-primary-50">
        {/* Header with Admin Link */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Paramount Launchpad
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  to="/admin"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Admin Panel
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Completion Content */}
        <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8 animate-fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-secondary-900 mb-4 animate-slide-up">
              Onboarding Complete! 🎉
            </h1>
            <p className="text-xl text-secondary-600 mb-8 animate-slide-up-delay">
              Thank you for completing the onboarding process. We've gathered all the information 
              needed to create your personalized product recommendations.
            </p>
            
            {/* Animated progress indicators */}
            <div className="flex justify-center space-x-4 mb-8 animate-slide-up-delay-2">
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Profile Created</span>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span className="text-sm font-medium">Preferences Saved</span>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <span className="text-sm font-medium">AI Analysis Ready</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-secondary-900 mb-6">
              What's Next?
            </h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-primary-600 text-sm font-medium">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-secondary-900">AI Analysis</h3>
                  <p className="text-sm text-secondary-600">Our AI is analyzing your responses to create personalized recommendations</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-primary-600 text-sm font-medium">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-secondary-900">Product Curation</h3>
                  <p className="text-sm text-secondary-600">We'll curate a selection of products tailored to your business needs</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-primary-600 text-sm font-medium">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-secondary-900">Account Setup</h3>
                  <p className="text-sm text-secondary-600">Your account manager will contact you within 24 hours to finalize your setup</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button className="w-full bg-primary-600 text-white py-4 px-8 rounded-lg font-medium hover:bg-primary-700 transition-colors text-lg">
              View Your Dashboard
            </button>
            <button className="w-full border border-primary-600 text-primary-600 py-4 px-8 rounded-lg font-medium hover:bg-primary-50 transition-colors text-lg">
              Contact Support
            </button>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header with Admin Link */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Paramount Launchpad
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/admin"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Admin Panel
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="w-full animate-fade-in">
          {error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Form</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : questionnaireId ? (
            <DynamicFormRenderer
              questionnaireId={questionnaireId}
              customerId={customerId}
              onComplete={handleComplete}
              onProgress={handleProgress}
            />
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading questionnaire...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
