import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

interface ConditionalLogic {
    showIf: string;
    condition: 'equals' | 'not_equals' | 'contains' | 'not_contains';
    value: string;
}

interface ConditionalLogicEditorProps {
    logic?: ConditionalLogic;
    onChange: (logic: ConditionalLogic) => void;
    availableQuestions?: Array<{ id: string; title: string; type: string }>;
}

export const ConditionalLogicEditor: React.FC<ConditionalLogicEditorProps> = ({
    logic,
    onChange,
    availableQuestions = []
}) => {
    const [formData, setFormData] = useState<ConditionalLogic>({
        showIf: logic?.showIf || '',
        condition: logic?.condition || 'equals',
        value: logic?.value || ''
    });

    const [errors, setErrors] = useState<{
        showIf?: string;
        condition?: string;
        value?: string;
    }>({});

    // Update form data when logic prop changes
    useEffect(() => {
        if (logic) {
            setFormData(logic);
        }
    }, [logic]);

    const conditionOptions = [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Not Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'not_contains', label: 'Not Contains' },
        { value: 'greater_than', label: 'Greater Than' },
        { value: 'less_than', label: 'Less Than' },
        { value: 'is_empty', label: 'Is Empty' },
        { value: 'is_not_empty', label: 'Is Not Empty' }
    ];

    const handleChange = (field: keyof ConditionalLogic, value: string) => {
        const newData = {
            ...formData,
            [field]: value
        };
        setFormData(newData);

        // Clear error when user makes changes
        setErrors(prev => ({ ...prev, [field]: undefined }));

        // Validate and update parent
        validateAndUpdate(newData);
    };

    const validateAndUpdate = (data: ConditionalLogic) => {
        const newErrors: typeof errors = {};

        if (!data.showIf.trim()) {
            newErrors.showIf = 'Please select a question to depend on';
        }

        if (!data.condition) {
            newErrors.condition = 'Please select a condition';
        }

        // Some conditions don't require a value
        const valueRequiredConditions = ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than'];
        if (valueRequiredConditions.includes(data.condition) && !data.value.trim()) {
            newErrors.value = 'Please enter a value to compare against';
        }

        setErrors(newErrors);

        // Only update parent if there are no errors
        if (Object.keys(newErrors).length === 0) {
            onChange(data);
        }
    };

    const handleClear = () => {
        const emptyLogic = {
            showIf: '',
            condition: 'equals' as const,
            value: ''
        };
        setFormData(emptyLogic);
        setErrors({});
        onChange(emptyLogic);
    };

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">Conditional Logic</h4>
                <Button
                    type="button"
                    onClick={handleClear}
                    variant="outline"
                    size="sm"
                >
                    Clear
                </Button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Show this question if
                    </label>
                    {availableQuestions.length > 0 ? (
                        <Select
                            options={availableQuestions.map(q => ({
                                value: q.id,
                                label: `${q.title} (${q.type})`
                            }))}
                            value={formData.showIf}
                            onChange={(e) => handleChange('showIf', e.target.value)}
                            error={errors.showIf}
                            showPlaceholder={false}
                        />
                    ) : (
                        <input
                            type="text"
                            value={formData.showIf}
                            onChange={(e) => handleChange('showIf', e.target.value)}
                            className={`block w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.showIf ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Question ID or reference"
                        />
                    )}
                    {errors.showIf && (
                        <p className="mt-1 text-sm text-red-600">{errors.showIf}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Condition
                    </label>
                    <Select
                        options={conditionOptions}
                        value={formData.condition}
                        onChange={(e) => handleChange('condition', e.target.value)}
                        error={errors.condition}
                        showPlaceholder={false}
                    />
                    {errors.condition && (
                        <p className="mt-1 text-sm text-red-600">{errors.condition}</p>
                    )}
                </div>

                {['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than'].includes(formData.condition) && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Value
                        </label>
                        <input
                            type="text"
                            value={formData.value}
                            onChange={(e) => handleChange('value', e.target.value)}
                            className={`block w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.value ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Expected value"
                        />
                        {errors.value && (
                            <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                        )}
                    </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h4 className="text-sm font-medium text-blue-800">How it works</h4>
                            <div className="mt-1 text-sm text-blue-700">
                                <p>
                                    {formData.showIf ? (
                                        <>
                                            This question will only be shown if the selected question's answer {formData.condition.replace('_', ' ')}
                                            {['is_empty', 'is_not_empty'].includes(formData.condition) ? '' : ` "${formData.value || 'the specified value'}"`}.
                                        </>
                                    ) : (
                                        'Select a question and condition to set up conditional logic.'
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
