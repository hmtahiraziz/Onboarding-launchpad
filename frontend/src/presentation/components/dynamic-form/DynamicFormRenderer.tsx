import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { ProgressBar } from '../ui/ProgressBar';
import { DynamicForm, DynamicQuestion, FormStep } from '@/domain/entities/DynamicForm';
import { DynamicFormRepository } from '@/data/repositories/DynamicFormRepository';
import { CustomerRepository } from '@/data/repositories/CustomerRepository';
import { ProductRepository } from '@/data/repositories/ProductRepository';
import { CreateCustomerRequest } from '@/domain/entities/Customer';
import { Product } from '@/domain/entities/Product';
import { ProductRecommendations } from '../product/ProductRecommendations';

interface DynamicFormRendererProps {
  questionnaireId: string | null;
  customerId: string;
  onComplete: (responses: any[]) => void;
  onProgress?: (step: number, progress: number) => void;
}

const dynamicFormRepository = new DynamicFormRepository();

export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  questionnaireId,
  customerId,
  onComplete,
  onProgress
}) => {
  const [form, setForm] = useState<DynamicForm | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Early return if no questionnaire ID
  if (!questionnaireId) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading questionnaire...</p>
      </div>
    );
  }
  const [responses, setResponses] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm();
  const dynamicFormRepository = new DynamicFormRepository();
  const customerRepository = new CustomerRepository();
  const productRepository = new ProductRepository();

  // Transform form responses into customer data
  const transformResponsesToCustomer = (responses: any[]): CreateCustomerRequest => {
    const responseMap = responses.reduce((acc, response) => {
      acc[response.questionId] = response.answer;
      return acc;
    }, {} as Record<string, any>);

    // Generate unique email with timestamp and random number
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    const baseEmail = responseMap['business_email'] || responseMap['email'] || 'demo';
    const uniqueEmail = `${baseEmail}+${timestamp}-${randomNum}@paramount-demo.com`;
    
    const businessName = responseMap['business_name'] || responseMap['businessName'] || 'Unknown Business';
    const venueType = responseMap['venue_type'] || responseMap['venueType'] || 'restaurant';
    const cuisineStyle = responseMap['cuisine_style'] || responseMap['cuisineStyle'] || 'International';
    const address = responseMap['address'] || responseMap['business_address'] || '123 Main Street';
    const city = responseMap['city'] || responseMap['business_city'] || 'Sydney';
    const state = responseMap['state'] || responseMap['business_state'] || 'NSW';
    const postcode = responseMap['postcode'] || responseMap['business_postcode'] || '2000';
    const country = responseMap['country'] || responseMap['business_country'] || 'Australia';

    return {
      email: uniqueEmail,
      name: businessName,
      businessProfile: {
        venueType,
        cuisineStyle,
        address,
        city,
        state,
        postcode,
        country,
        // Include any other form data
        ...responseMap
      }
    };
  };

  // Fetch product recommendations
  const fetchProductRecommendations = async (customerId: string) => {
    setProductsLoading(true);
    setProductsError(null);
    
    try {
      console.log('Fetching product recommendations for customer ID:', customerId);
      const products = await productRepository.getRecommendedProducts(customerId, 100, true);
      console.log('Product recommendations API response:', products);
      setRecommendedProducts(products);
      setShowProducts(true);
      console.log('Product recommendations loaded successfully:', products.length, 'products');
    } catch (error) {
      console.error('Error fetching product recommendations:', error);
      setProductsError(error instanceof Error ? error.message : 'Failed to load recommendations');
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (questionnaireId) {
      loadForm();
    }
  }, [questionnaireId]);

  useEffect(() => {
    loadProgress();
  }, [form, customerId]);

  const loadForm = async () => {
    try {
      setLoading(true);
      setError(null);
      const dynamicForm = await dynamicFormRepository.getFormByQuestionnaireId(questionnaireId);
      setForm(dynamicForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    if (!form) return;
    
    try {
      const progress = await dynamicFormRepository.getFormProgress(form.id, customerId);
      setCurrentStepIndex(progress.currentStep);
      setResponses(progress.responses);
      
      // Restore form values
      progress.responses.forEach((response: any) => {
        setValue(response.questionId, response.answer);
      });
    } catch (err) {
      console.warn('Could not load progress:', err);
    }
  };

  const onSubmit = async (data: any) => {
    if (!form) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const currentStep = form.steps[currentStepIndex];
      const stepResponses: any[] = [];

      // Collect responses for current step
      currentStep.questions.forEach(question => {
        if (data[question.id] !== undefined) {
          stepResponses.push({
            questionId: question.id,
            answer: data[question.id],
            timestamp: new Date().toISOString()
          });
        }
      });

      // Update responses
      const updatedResponses = [...responses, ...stepResponses];
      setResponses(updatedResponses);

      // Save progress
      await dynamicFormRepository.saveFormProgress(
        form.id, 
        customerId, 
        currentStepIndex, 
        updatedResponses
      );

      // Check if this is the last step
      if (currentStepIndex >= form.steps.length - 1) {
        // Show success animation
        setShowSuccess(true);
        
        try {
          // Submit final form
          await dynamicFormRepository.submitFormResponse({
            formId: form.id,
            customerId,
            responses: updatedResponses,
            completedAt: new Date().toISOString(),
            timeSpent: 0 // You can calculate this
          });

          // Create customer with form data
          const customerData = transformResponsesToCustomer(updatedResponses);
          console.log('Creating customer with data:', customerData);
          
          const createdCustomer = await customerRepository.createCustomer(customerData);
          console.log('Customer created successfully:', createdCustomer);
          console.log('Customer ID for recommendations:', createdCustomer?.id);
          
          // Fetch product recommendations using the created customer ID
          if (createdCustomer && createdCustomer.id) {
            console.log('Calling product recommendations API with customer ID:', createdCustomer.id);
            await fetchProductRecommendations(createdCustomer.id);
          } else {
            console.error('No customer ID available for product recommendations');
            setProductsError('Customer ID not available for recommendations');
          }
          
        } catch (error) {
          console.error('Error creating customer:', error);
          // Continue with completion even if customer creation fails
        }
        
        // Delay before calling onComplete for better UX
        setTimeout(() => {
          onComplete(updatedResponses);
        }, 1500);
        return;
      }

      // Show success feedback before moving to next step
      setShowSuccess(true);
      
      setTimeout(() => {
        // Move to next step
        const nextStepIndex = currentStepIndex + 1;
        setCurrentStepIndex(nextStepIndex);
        
        // Reset form for next step
        reset();
        setShowSuccess(false);
        
        // Notify progress
        if (onProgress) {
          const progressPercentage = ((nextStepIndex + 1) / form.steps.length) * 100;
          onProgress(nextStepIndex, progressPercentage);
        }
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit step');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      reset();
    }
  };

  const renderQuestion = (question: DynamicQuestion) => {
    const commonProps = {
      label: question.title,
      error: errors[question.id]?.message as string,
      ...register(question.id, {
        required: question.isRequired ? `${question.title} is required` : false,
        ...question.validationRules
      })
    };

    switch (question.type) {
      case 'dropdown':
        return (
          <Select
            key={question.id}
            {...commonProps}
            options={question.options?.map(option => ({ value: option, label: option })) || []}
          />
        );

      case 'radio':
        return (
          <div key={question.id}>
            <label className="block text-sm font-medium text-secondary-700 mb-4">
              {question.title}
            </label>
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <label 
                  key={option} 
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 cursor-pointer group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <input
                    type="radio"
                    value={option}
                    {...register(question.id)}
                    className="mr-3 w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-gray-700 group-hover:text-primary-700 transition-colors duration-200">
                    {option}
                  </span>
                </label>
              ))}
            </div>
            {errors[question.id] && (
              <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors[question.id]?.message as string}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={question.id}>
            <label className="block text-sm font-medium text-secondary-700 mb-4">
              {question.title}
            </label>
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <label 
                  key={option} 
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 cursor-pointer group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <input
                    type="checkbox"
                    value={option}
                    {...register(question.id)}
                    className="mr-3 w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                  />
                  <span className="text-gray-700 group-hover:text-primary-700 transition-colors duration-200">
                    {option}
                  </span>
                </label>
              ))}
            </div>
            {errors[question.id] && (
              <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors[question.id]?.message as string}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={question.id}>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              {question.title}
            </label>
            <textarea
              {...register(question.id)}
              className="block w-full px-4 py-3 border border-secondary-300 rounded-lg shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-primary-300 resize-none"
              rows={4}
              placeholder={question.description}
            />
            {errors[question.id] && (
              <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors[question.id]?.message as string}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <Input
            key={question.id}
            {...commonProps}
            type="number"
            placeholder={question.description}
          />
        );

      case 'date':
        return (
          <Input
            key={question.id}
            {...commonProps}
            type="date"
          />
        );

      case 'text':
      default:
        return (
          <Input
            key={question.id}
            {...commonProps}
            type="text"
            placeholder={question.description}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading dynamic form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">Error</h3>
          <p className="text-secondary-600 mb-4">{error}</p>
          <Button onClick={loadForm}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  // Show product recommendations if available
  if (showProducts) {
    return (
      <div className="max-w-7xl mx-auto">
        <ProductRecommendations 
          products={recommendedProducts}
          loading={productsLoading}
          error={productsError}
        />
      </div>
    );
  }

  if (!form || !form.steps[currentStepIndex]) {
    return null;
  }

  const currentStep = form.steps[currentStepIndex];
  const progressPercentage = ((currentStepIndex + 1) / form.steps.length) * 100;

  // Success feedback overlay
  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {currentStepIndex >= form.steps.length - 1 ? 'All Done!' : 'Step Complete!'}
            </h3>
            <p className="text-gray-600">
              {currentStepIndex >= form.steps.length - 1 
                ? 'Processing your responses...' 
                : 'Moving to next step...'}
            </p>
            <div className="mt-6">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="transform transition-all duration-300 hover:shadow-lg">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-2">
                {form.title}
              </h2>
              {form.description && (
                <p className="text-secondary-600">
                  {form.description}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-secondary-500 mb-1">
                Step {currentStepIndex + 1} of {form.steps.length}
              </div>
              <div className="text-xs text-secondary-400">
                Customer ID: {customerId.slice(-8)}
              </div>
            </div>
          </div>
          
          
          <ProgressBar 
            progress={progressPercentage} 
            showPercentage 
            size="lg"
            steps={form.steps.length}
            currentStep={currentStepIndex}
          />
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            {currentStep.title}
          </h3>
          {currentStep.description && (
            <p className="text-secondary-600 mb-4">
              {currentStep.description}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {currentStep.questions.map((question, index) => (
            <div 
              key={question.id}
              className="transform transition-all duration-300 hover:scale-[1.02]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="animate-fade-in">
                {renderQuestion(question)}
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStepIndex === 0}
              className="transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {currentStepIndex >= form.steps.length - 1 ? 'Completing...' : 'Saving...'}
                </>
              ) : (
                <>
                  {currentStepIndex >= form.steps.length - 1 ? 'Complete' : 'Next'}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
