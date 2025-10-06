import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { QuestionnaireBuilder } from './QuestionnaireBuilder';
import { CSVImportModal } from './CSVImportModal';
import { questionnaireApi, Questionnaire } from '@/data/api/questionnaireApi';

export const QuestionnaireList: React.FC = () => {
    const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showBuilder, setShowBuilder] = useState(false);
    const [editingQuestionnaire, setEditingQuestionnaire] = useState<Questionnaire | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'inactive' | 'archived'>('all');
    const [showCSVImport, setShowCSVImport] = useState(false);

    // Load questionnaires on component mount
    useEffect(() => {
        loadQuestionnaires();
    }, []);

    const loadQuestionnaires = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await questionnaireApi.getQuestionnaires();
            setQuestionnaires(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load questionnaires');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setEditingQuestionnaire(null);
        setShowBuilder(true);
    };

    const handleCSVImport = async (file: File, title: string, description: string) => {
        try {
            setLoading(true);
            setError(null);
            
            const formData = new FormData();
            formData.append('csvFile', file);
            if (title) formData.append('title', title);
            if (description) formData.append('description', description);

            const response = await fetch('/api/questionnaires/import-csv', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                await loadQuestionnaires(); // Reload the list
            } else {
                throw new Error(result.error || 'Failed to import CSV');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to import CSV');
            throw err; // Re-throw to let the modal handle the error
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (questionnaire: Questionnaire) => {
        setEditingQuestionnaire(questionnaire);
        setShowBuilder(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this questionnaire?')) {
            try {
                setLoading(true);
                setError(null);
                await questionnaireApi.deleteQuestionnaire(id);
                setQuestionnaires(prev => prev.filter(q => q.id !== id));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete questionnaire');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleActivate = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            
            // Check if there's already an active questionnaire
            const activeQuestionnaires = questionnaires.filter(q => q.status === 'active');
            if (activeQuestionnaires.length > 0) {
                const activeId = activeQuestionnaires[0].id;
                if (activeId !== id) {
                    // Show confirmation dialog
                    const confirmed = window.confirm(
                        `There is already an active questionnaire. Activating this questionnaire will automatically deactivate the current active questionnaire (${activeQuestionnaires[0].title}). Do you want to continue?`
                    );
                    if (!confirmed) {
                        setLoading(false);
                        return;
                    }
                }
            }
            
            await questionnaireApi.activateQuestionnaire(id);
            await loadQuestionnaires();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to activate questionnaire');
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            await questionnaireApi.deactivateQuestionnaire(id);
            await loadQuestionnaires();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to deactivate questionnaire');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, status: 'draft' | 'active' | 'inactive' | 'archived') => {
        try {
            setLoading(true);
            setError(null);
            await questionnaireApi.updateQuestionnaireStatus(id, status);
            await loadQuestionnaires();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update questionnaire status');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            case 'archived':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredQuestionnaires = questionnaires.filter(questionnaire => {
        if (statusFilter === 'all') return true;
        return questionnaire.status === statusFilter;
    });

    const handleSaveQuestionnaire = async (questionnaire: Questionnaire) => {
        try {
            setLoading(true);
            setError(null);

            if (editingQuestionnaire) {
                // Update existing questionnaire
                const updatedQuestionnaire = await questionnaireApi.updateQuestionnaire(questionnaire);
                setQuestionnaires(prev =>
                    prev.map(q => q.id === questionnaire.id ? updatedQuestionnaire : q)
                );
            } else {
                // Create new questionnaire
                const newQuestionnaire = await questionnaireApi.createQuestionnaire({
                    title: questionnaire.title,
                    description: questionnaire.description,
                    questions: questionnaire.questions
                });
                setQuestionnaires(prev => [...prev, newQuestionnaire]);
            }

            setShowBuilder(false);
            setEditingQuestionnaire(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save questionnaire');
        } finally {
            setLoading(false);
        }
    };

    if (showBuilder) {
        return (
            <QuestionnaireBuilder
                questionnaire={editingQuestionnaire}
                onSave={handleSaveQuestionnaire}
                onCancel={() => {
                    setShowBuilder(false);
                    setEditingQuestionnaire(null);
                }}
            />
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading questionnaires...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={loadQuestionnaires}>
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Questionnaires</h2>
                <div className="flex space-x-3">
                    <Button 
                        variant="outline" 
                        onClick={() => setShowCSVImport(true)} 
                        disabled={loading}
                        className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Import CSV
                    </Button>
                    <Button onClick={handleCreateNew} disabled={loading}>
                        Create New Questionnaire
                    </Button>
                </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Filter by status:</span>
                <div className="flex space-x-2">
                    {['all', 'active', 'draft', 'inactive', 'archived'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status as any)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                statusFilter === status
                                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
                {statusFilter === 'active' && (
                    <div className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full border border-green-300">
                        💡 These questionnaires are visible to customers
                    </div>
                )}
            </div>

            {/* Active Questionnaire Indicator */}
            {(() => {
                const activeQuestionnaires = questionnaires.filter(q => q.status === 'active');
                if (activeQuestionnaires.length > 0) {
                    return (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-green-800">
                                    Currently Active: <strong>{activeQuestionnaires[0].title}</strong>
                                </span>
                            </div>
                            <p className="text-xs text-green-600 mt-1">
                                This questionnaire is currently being used for customer onboarding. Only one questionnaire can be active at a time.
                            </p>
                        </div>
                    );
                } else {
                    return (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm font-medium text-yellow-800">
                                    No Active Questionnaire
                                </span>
                            </div>
                            <p className="text-xs text-yellow-600 mt-1">
                                No questionnaire is currently active. Customers will not be able to access the onboarding form.
                            </p>
                        </div>
                    );
                }
            })()}

            <div className="grid gap-6">
                {filteredQuestionnaires.map((questionnaire) => (
                    <Card key={questionnaire.id} className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {questionnaire.title}
                                    </h3>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(questionnaire.status)}`}>
                                        {questionnaire.status}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-3">
                                    {questionnaire.description}
                                </p>
                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                    <span>{questionnaire.questions?.length || 0} questions</span>
                                    <span>Created: {questionnaire.createdAt}</span>
                                    <span>Updated: {questionnaire.updatedAt}</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {/* Status Management Buttons */}
                                {questionnaire.status === 'draft' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleActivate(questionnaire.id)}
                                        className="text-green-600 hover:text-green-700 border-green-300 hover:border-green-400"
                                    >
                                        Activate
                                    </Button>
                                )}
                                {questionnaire.status === 'active' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeactivate(questionnaire.id)}
                                        className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400"
                                    >
                                        Deactivate
                                    </Button>
                                )}
                                {questionnaire.status === 'inactive' && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleActivate(questionnaire.id)}
                                            className="text-green-600 hover:text-green-700 border-green-300 hover:border-green-400"
                                        >
                                            Activate
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleStatusChange(questionnaire.id, 'archived')}
                                            className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                        >
                                            Archive
                                        </Button>
                                    </>
                                )}
                                {questionnaire.status === 'archived' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStatusChange(questionnaire.id, 'draft')}
                                        className="text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
                                    >
                                        Restore
                                    </Button>
                                )}
                                
                                {/* Edit and Delete Buttons */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(questionnaire)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(questionnaire.id)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {filteredQuestionnaires.length === 0 && (
                <Card className="p-12 text-center">
                    <div className="text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            {statusFilter === 'all' ? 'No questionnaires' : `No ${statusFilter} questionnaires`}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {statusFilter === 'all' 
                                ? 'Get started by creating a new questionnaire.'
                                : `No questionnaires with status "${statusFilter}" found.`
                            }
                        </p>
                        <div className="mt-6">
                            <Button onClick={handleCreateNew}>
                                Create New Questionnaire
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* CSV Import Modal */}
            <CSVImportModal
                isOpen={showCSVImport}
                onClose={() => setShowCSVImport(false)}
                onImport={handleCSVImport}
            />
        </div>
    );
};
