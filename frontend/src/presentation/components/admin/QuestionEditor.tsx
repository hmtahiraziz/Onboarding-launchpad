import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { ConditionalLogicEditor } from './ConditionalLogicEditor';

interface Question {
    id: string;
    title: string;
    description?: string;
    type: 'dropdown' | 'radio' | 'checkbox';
    options: string[]; // Always required for all question types
    required?: boolean;
    isRequired?: boolean;
    status: 'active' | 'inactive';
    hidden?: boolean;
    isHidden?: boolean;
    order: number;
    conditionalLogic?: ConditionalLogic;
}

interface ConditionalLogic {
    showIf: string;
    condition: 'equals' | 'not_equals' | 'contains' | 'not_contains';
    value: string;
}

interface QuestionFormData {
    title: string;
    description: string;
    type: string;
    required: boolean;
    status: string;
    hidden: boolean;
}

interface QuestionEditorProps {
    question: Question;
    onSave: (question: Question) => void;
    onCancel: () => void;
    availableQuestions?: Array<{ id: string; title: string; type: string }>;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
    question,
    onSave,
    onCancel,
    availableQuestions = []
}) => {
    // Debug logging
    console.log('QuestionEditor received question:', question);
    console.log('Question type:', question.type);
    console.log('Question options:', question.options);

    const [options, setOptions] = useState<string[]>(question.options || []);
    const [newOption, setNewOption] = useState('');
    const [showConditionalLogic, setShowConditionalLogic] = useState(false);
    const [conditionalLogic, setConditionalLogic] = useState<ConditionalLogic | undefined>(
        question.conditionalLogic
    );
    const [formErrors, setFormErrors] = useState<{
        questionType?: string;
        status?: string;
        options?: string;
    }>({});

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<QuestionFormData>({
        mode: 'onBlur', // Change from 'onChange' to 'onBlur' to prevent premature validation
        defaultValues: {
            title: question.title,
            description: question.description || '',
            type: question.type,
            required: question.required ?? question.isRequired ?? false,
            status: question.status || 'active',
            hidden: question.hidden ?? question.isHidden ?? false
        }
    });

    // Set initial values properly
    useEffect(() => {
        setValue('status', question.status || 'active');
        setValue('type', question.type);
    }, [question.status, question.type, setValue]);

    const questionType = watch('type');
    const [selectedType, setSelectedType] = useState<string>(question.type);

    // Debug logging
    console.log('Current questionType from watch:', questionType);
    console.log('Current selectedType:', selectedType);

    // Sync selectedType with form value
    useEffect(() => {
        if (questionType && questionType !== selectedType) {
            setSelectedType(questionType);
        }
    }, [questionType, selectedType]);


    // Initialize options from question data when component mounts
    useEffect(() => {
        if (question.options && question.options.length > 0) {
            setOptions(question.options);
        }
    }, [question.options]);

    // Update options when question type changes
    useEffect(() => {
        // All question types require options, so always ensure we have at least 2 default options
        if (options.length === 0) {
            setOptions(['Option 1', 'Option 2']);
        }
        // Clear form errors when type changes
        setFormErrors(prev => ({ ...prev, questionType: undefined, options: undefined }));
    }, [questionType, options.length]);

    const questionTypeOptions = [
        { value: 'dropdown', label: 'Dropdown' },
        { value: 'radio', label: 'Single Choice (Radio)' },
        { value: 'checkbox', label: 'Multiple Choice (Checkbox)' }
    ];

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
    ];

    const handleAddOption = () => {
        if (newOption.trim()) {
            setOptions([...options, newOption.trim()]);
            setNewOption('');
            // Clear options error when user adds an option
            setFormErrors(prev => ({ ...prev, options: undefined }));
        }
    };


    const handleUpdateOption = (index: number, value: string) => {
        const updatedOptions = [...options];
        updatedOptions[index] = value.trim();
        setOptions(updatedOptions);

        // Clear options error when user updates an option
        if (value.trim()) {
            setFormErrors(prev => ({ ...prev, options: undefined }));
        }
    };

    const handleRemoveOption = (index: number) => {
        const updatedOptions = options.filter((_, i) => i !== index);
        setOptions(updatedOptions);
    };

    const onSubmit = (data: QuestionFormData) => {
        // Clear previous errors
        setFormErrors({});

        // Debug logging
        console.log('Form submission data:', data);
        console.log('Question type from form:', questionType);
        console.log('Form errors:', errors);

        // Validate required fields
        const newErrors: typeof formErrors = {};

        // Validate question type
        if (!questionType || questionType.trim() === '') {
            newErrors.questionType = 'Please select a question type';
        }

        // Validate status
        if (!data.status || data.status.trim() === '') {
            newErrors.status = 'Please select a status';
        }

        // All question types require options
        if (options.length === 0) {
            newErrors.options = 'Please add at least one option for this question type';
        } else {
            // Check for blank options
            const blankOptions = options.filter(option => !option.trim());
            if (blankOptions.length > 0) {
                newErrors.options = 'All options must have text. Please remove blank options or add text.';
            }
        }

        // If there are validation errors, set them and prevent submission
        if (Object.keys(newErrors).length > 0) {
            setFormErrors(newErrors);
            return;
        }

        const updatedQuestion: Question = {
            ...question,
            title: data.title,
            description: data.description,
            type: questionType as 'dropdown' | 'radio' | 'checkbox',
            options: options, // Always include options for all question types
            required: data.required,
            isRequired: data.required,
            status: data.status as 'active' | 'inactive',
            hidden: data.hidden,
            isHidden: data.hidden,
            conditionalLogic: showConditionalLogic ? conditionalLogic : undefined
        };
        onSave(updatedQuestion);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Question</h2>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Question Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register('title', { required: 'Question title is required' })}
                                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.title
                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300'
                                        }`}
                                    placeholder="Enter your question"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    {...register('description')}
                                    rows={3}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Add additional context or instructions"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Question Type <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    options={questionTypeOptions}
                                    {...register('type', {
                                        onChange: (e) => {
                                            setSelectedType(e.target.value);
                                            // Clear error when user makes selection
                                            setFormErrors(prev => ({ ...prev, questionType: undefined }));
                                        }
                                    })}
                                    error={formErrors.questionType}
                                    showPlaceholder={false}
                                />
                            </div>


                            {/* Options section - always show since all question types require options */}
                            {questionType && (
                                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Options for {questionType === 'dropdown' ? 'Dropdown' : questionType === 'radio' ? 'Single Choice' : 'Multiple Choice'}
                                    </label>
                                    <p className="text-xs text-gray-500 mb-3">
                                        All options must have text. Blank options are not allowed.
                                    </p>
                                    <div className="space-y-3">
                                        {options.map((option, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => handleUpdateOption(index, e.target.value)}
                                                    className={`flex-1 px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!option.trim()
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-gray-300'
                                                        }`}
                                                    placeholder="Enter option text"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveOption(index)}
                                                    className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                                                    title="Remove option"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                        <div className="flex items-center space-x-2 pt-2 border-t border-blue-200">
                                            <span className="text-sm text-gray-500 w-6">+</span>
                                            <input
                                                type="text"
                                                value={newOption}
                                                onChange={(e) => setNewOption(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Add new option"
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleAddOption}
                                                disabled={!newOption.trim()}
                                                size="sm"
                                            >
                                                Add
                                            </Button>
                                        </div>
                                        {options.length === 0 && (
                                            <div className="text-center py-4">
                                                <p className="text-sm text-red-600 mb-2 font-medium">
                                                    At least one option is required
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Add at least one option for this question type
                                                </p>
                                            </div>
                                        )}
                                        {formErrors.options && (
                                            <div className="text-center py-2">
                                                <p className="text-sm text-red-600 font-medium">
                                                    {formErrors.options}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <div className="space-y-2">
                                        {statusOptions.map((option) => (
                                            <label key={option.value} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    value={option.value}
                                                    {...register('status', {
                                                        onChange: () => {
                                                            // Clear error when user makes selection
                                                            setFormErrors(prev => ({ ...prev, status: undefined }));
                                                        }
                                                    })}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">
                                                    {option.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {formErrors.status && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {formErrors.status}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Settings
                                </label>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            {...register('required')}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 text-sm text-gray-700">
                                            Required
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            {...register('hidden')}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 text-sm text-gray-700">
                                            Hidden
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Conditional Logic
                                </label>
                                <Button
                                    type="button"
                                    onClick={() => setShowConditionalLogic(!showConditionalLogic)}
                                    variant="outline"
                                    size="sm"
                                >
                                    {showConditionalLogic ? 'Hide Logic' : 'Show Logic'}
                                </Button>
                                {showConditionalLogic && (
                                    <div className="mt-3">
                                        <ConditionalLogicEditor
                                            logic={conditionalLogic}
                                            onChange={setConditionalLogic}
                                            availableQuestions={availableQuestions.filter(q => q.id !== question.id)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                        <Button
                            type="button"
                            onClick={onCancel}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            Save Question
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
