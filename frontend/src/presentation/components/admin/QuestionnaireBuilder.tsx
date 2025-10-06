import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { QuestionEditor } from './QuestionEditor';

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
    conditionalLogic?: any;
}

interface Questionnaire {
    id: string;
    title: string;
    description: string;
    status: 'draft' | 'active' | 'inactive';
    questions: Question[];
}

interface QuestionnaireFormData {
    title: string;
    description: string;
}

interface QuestionnaireBuilderProps {
    questionnaire?: Questionnaire | null;
    onSave: (questionnaire: Questionnaire) => void;
    onCancel: () => void;
}

export const QuestionnaireBuilder: React.FC<QuestionnaireBuilderProps> = ({
    questionnaire,
    onSave,
    onCancel
}) => {
    const [questions, setQuestions] = useState<Question[]>(questionnaire?.questions || []);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [formErrors, setFormErrors] = useState<{
        questions?: string;
    }>({});

    const { register, handleSubmit, formState: { errors } } = useForm<QuestionnaireFormData>({
        mode: 'onChange',
        defaultValues: {
            title: questionnaire?.title || '',
            description: questionnaire?.description || ''
        }
    });

    const handleAddQuestion = () => {
        const newQuestion: Question = {
            id: `q_${Date.now()}`,
            title: 'New Question',
            type: 'dropdown',
            options: ['Option 1', 'Option 2'],
            required: true,
            status: 'active',
            hidden: false,
            order: questions.length + 1
        };
        setQuestions(prev => [...prev, newQuestion]);
        setEditingQuestion(newQuestion);
        // Clear questions error when user adds a question
        setFormErrors(prev => ({ ...prev, questions: undefined }));
    };

    const handleEditQuestion = (question: Question) => {
        setEditingQuestion(question);
    };

    const handleSaveQuestion = (updatedQuestion: Question) => {
        setQuestions(prev =>
            prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
        );
        setEditingQuestion(null);
    };

    const handleDeleteQuestion = (questionId: string) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            setQuestions(prev => prev.filter(q => q.id !== questionId));
        }
    };

    const handleMoveQuestion = (questionId: string, direction: 'up' | 'down') => {
        const currentIndex = questions.findIndex(q => q.id === questionId);
        if (currentIndex === -1) return;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= questions.length) return;

        const newQuestions = [...questions];
        [newQuestions[currentIndex], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[currentIndex]];

        // Update order numbers
        newQuestions.forEach((q, index) => {
            q.order = index + 1;
        });

        setQuestions(newQuestions);
    };

    const onSubmit = (data: QuestionnaireFormData) => {
        // Clear previous errors
        setFormErrors({});

        // Validate that at least one question is added
        if (questions.length === 0) {
            setFormErrors({ questions: 'Please add at least one question to the questionnaire' });
            return;
        }

        const questionnaireData: Questionnaire = {
            id: questionnaire?.id || `q_${Date.now()}`,
            title: data.title,
            description: data.description,
            status: 'draft',
            questions: questions
        };
        onSave(questionnaireData);
    };

    if (editingQuestion) {
        return (
            <QuestionEditor
                question={editingQuestion}
                onSave={handleSaveQuestion}
                onCancel={() => setEditingQuestion(null)}
                availableQuestions={questions.map(q => ({
                    id: q.id,
                    title: q.title,
                    type: q.type
                }))}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                    {questionnaire ? 'Edit Questionnaire' : 'Create New Questionnaire'}
                </h2>
                <Button variant="outline" onClick={onCancel}>
                    Back to List
                </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Questionnaire Details</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                {...register('title', { required: 'Title is required' })}
                                className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.title
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300'
                                    }`}
                                placeholder="Enter questionnaire title"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                {...register('description', { required: 'Description is required' })}
                                rows={3}
                                className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.description
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300'
                                    }`}
                                placeholder="Enter questionnaire description"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                            )}
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
                        <Button type="button" onClick={handleAddQuestion}>
                            + Add Question
                        </Button>
                    </div>

                    {formErrors.questions && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm font-medium">{formErrors.questions}</p>
                        </div>
                    )}

                    {questions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No questions added yet. Click "Add Question" to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {questions.map((question, index) => (
                                <div key={question.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-500 w-8">{question.order}.</span>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{question.title}</h4>
                                            <p className="text-sm text-gray-500">
                                                {question.type} • {question.required ? 'Required' : 'Optional'} • {question.status}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleMoveQuestion(question.id, 'up')}
                                            disabled={index === 0}
                                        >
                                            ↑
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleMoveQuestion(question.id, 'down')}
                                            disabled={index === questions.length - 1}
                                        >
                                            ↓
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditQuestion(question)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteQuestion(question.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        Save Questionnaire
                    </Button>
                </div>
            </form>
        </div>
    );
};
