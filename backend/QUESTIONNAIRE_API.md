# Questionnaire API Documentation

This document describes the REST API endpoints for the dynamic questionnaire functionality in Paramount Launchpad.

## Base URL
```
http://localhost:3000/api/questionnaires
```

## Authentication
Currently, no authentication is required. In production, JWT tokens should be used.

## Data Models

### Questionnaire
```typescript
interface Questionnaire {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  isActive: boolean;
  createdBy?: string;
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Question
```typescript
interface Question {
  id: string;
  questionnaireId: string;
  title: string;
  description?: string;
  type: 'dropdown' | 'radio' | 'checkbox' | 'text' | 'textarea' | 'number' | 'date';
  options: string[];
  isRequired: boolean;
  status: 'active' | 'inactive';
  isHidden: boolean;
  order: number;
  conditionalLogic?: ConditionalLogic;
  validationRules: ValidationRules;
  createdAt: Date;
  updatedAt: Date;
}
```

### Conditional Logic
```typescript
interface ConditionalLogic {
  showIf: string; // Question ID to check
  condition: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string;
}
```

### Validation Rules
```typescript
interface ValidationRules {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  required?: boolean;
  customMessage?: string;
}
```

## API Endpoints

### 1. Get All Questionnaires
**GET** `/api/questionnaires`

**Query Parameters:**
- `status` (optional): Filter by status (`draft`, `active`, `inactive`, `archived`)
- `active` (optional): Filter active questionnaires (`true`/`false`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Customer Onboarding Questionnaire",
      "description": "Main questionnaire for new customers",
      "status": "active",
      "isActive": true,
      "createdBy": "admin@example.com",
      "questions": [...],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

### 2. Get Questionnaire by ID
**GET** `/api/questionnaires/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Customer Onboarding Questionnaire",
    "description": "Main questionnaire for new customers",
    "status": "active",
    "isActive": true,
    "createdBy": "admin@example.com",
    "questions": [
      {
        "id": "uuid",
        "title": "What type of venue do you operate?",
        "description": "Select the type that best describes your business",
        "type": "radio",
        "options": ["Restaurant", "Bar", "Hotel", "Nightclub", "Cafe", "Catering"],
        "isRequired": true,
        "status": "active",
        "isHidden": false,
        "order": 0,
        "conditionalLogic": null,
        "validationRules": {},
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 3. Create Questionnaire
**POST** `/api/questionnaires`

**Request Body:**
```json
{
  "title": "Customer Onboarding Questionnaire",
  "description": "Main questionnaire for new customers",
  "status": "draft",
  "isActive": true,
  "createdBy": "admin@example.com",
  "questions": [
    {
      "title": "What type of venue do you operate?",
      "description": "Select the type that best describes your business",
      "type": "radio",
      "options": ["Restaurant", "Bar", "Hotel", "Nightclub", "Cafe", "Catering"],
      "isRequired": true,
      "status": "active",
      "isHidden": false,
      "order": 0,
      "conditionalLogic": null,
      "validationRules": {}
    },
    {
      "title": "What is your cuisine style?",
      "description": "Select the cuisine style that best describes your venue",
      "type": "dropdown",
      "options": ["Fine Dining", "Casual", "Fast Food", "Ethnic", "Fusion", "Other"],
      "isRequired": true,
      "status": "active",
      "isHidden": false,
      "order": 1,
      "conditionalLogic": {
        "showIf": "previous-question-id",
        "condition": "equals",
        "value": "Restaurant"
      },
      "validationRules": {}
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Customer Onboarding Questionnaire",
    "description": "Main questionnaire for new customers",
    "status": "draft",
    "isActive": true,
    "createdBy": "admin@example.com",
    "questions": [...],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 4. Update Questionnaire
**PUT** `/api/questionnaires/:id`

**Request Body:** Same as create questionnaire

**Response:** Same as create questionnaire

### 5. Delete Questionnaire
**DELETE** `/api/questionnaires/:id`

**Response:**
```json
{
  "success": true,
  "message": "Questionnaire deleted successfully"
}
```

### 6. Start Questionnaire Response
**POST** `/api/questionnaires/:id/start`

**Request Body:**
```json
{
  "customerId": "customer-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "response-uuid",
    "questionnaireId": "questionnaire-uuid",
    "customerId": "customer-uuid",
    "responses": [],
    "status": "in_progress",
    "startedAt": "2024-01-15T10:30:00Z",
    "completedAt": null,
    "lastActivityAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 7. Submit Answer
**POST** `/api/questionnaires/responses/:responseId/answer`

**Request Body:**
```json
{
  "questionId": "question-uuid",
  "answer": "Restaurant",
  "timeSpent": 15
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "response-uuid",
    "questionnaireId": "questionnaire-uuid",
    "customerId": "customer-uuid",
    "responses": [
      {
        "questionId": "question-uuid",
        "questionTitle": "What type of venue do you operate?",
        "answer": "Restaurant",
        "answeredAt": "2024-01-15T10:30:15Z",
        "timeSpent": 15
      }
    ],
    "status": "in_progress",
    "startedAt": "2024-01-15T10:30:00Z",
    "completedAt": null,
    "lastActivityAt": "2024-01-15T10:30:15Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:15Z"
  }
}
```

### 8. Complete Questionnaire
**POST** `/api/questionnaires/responses/:responseId/complete`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "response-uuid",
    "questionnaireId": "questionnaire-uuid",
    "customerId": "customer-uuid",
    "responses": [...],
    "status": "completed",
    "startedAt": "2024-01-15T10:30:00Z",
    "completedAt": "2024-01-15T10:35:00Z",
    "lastActivityAt": "2024-01-15T10:35:00Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:35:00Z"
  }
}
```

### 9. Get Questionnaire Response
**GET** `/api/questionnaires/responses/:responseId`

**Response:** Same as submit answer response

### 10. Get All Responses for Questionnaire
**GET** `/api/questionnaires/:id/responses`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "response-uuid",
      "questionnaireId": "questionnaire-uuid",
      "customerId": "customer-uuid",
      "responses": [...],
      "status": "completed",
      "startedAt": "2024-01-15T10:30:00Z",
      "completedAt": "2024-01-15T10:35:00Z",
      "lastActivityAt": "2024-01-15T10:35:00Z",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:35:00Z"
    }
  ],
  "total": 1
}
```

### 11. Get Customer's Responses
**GET** `/api/questionnaires/customer/:customerId/responses`

**Response:** Same as get all responses for questionnaire

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## Validation Rules

### Questionnaire Validation:
- `title` is required and must be 1-255 characters
- `description` is optional and must be max 1000 characters
- `status` must be one of: `draft`, `active`, `inactive`, `archived`
- `questions` array is required and must have at least 1 question

### Question Validation:
- `title` is required and must be 1-500 characters
- `description` is optional and must be max 1000 characters
- `type` is required and must be one of: `dropdown`, `radio`, `checkbox`, `text`, `textarea`, `number`, `date`
- `options` is required for `dropdown`, `radio`, and `checkbox` types
- `conditionalLogic.showIf` must reference a valid question ID
- `conditionalLogic.condition` must be one of the valid operators
- `conditionalLogic.value` is required for most conditions

### Answer Validation:
- `questionId` must be a valid UUID
- `answer` must match the question type requirements
- `timeSpent` must be a positive integer (seconds)

## Database Schema

### Tables Created:
1. **questionnaires** - Main questionnaire data
2. **questions** - Individual questions within questionnaires
3. **questionnaire_responses** - Customer responses to questionnaires

### Key Features:
- **JSONB Storage** for flexible data (options, conditional logic, validation rules, responses)
- **Foreign Key Constraints** for data integrity
- **Indexes** for performance optimization
- **Enum Types** for data validation
- **Cascade Deletes** for data consistency

## Usage Examples

### Creating a Dynamic Questionnaire:
```bash
curl -X POST http://localhost:3000/api/questionnaires \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Customer Onboarding",
    "description": "Dynamic onboarding questionnaire",
    "status": "active",
    "questions": [
      {
        "title": "What type of venue?",
        "type": "radio",
        "options": ["Restaurant", "Bar", "Hotel"],
        "isRequired": true,
        "order": 0
      },
      {
        "title": "What cuisine style?",
        "type": "dropdown",
        "options": ["Fine Dining", "Casual", "Fast Food"],
        "isRequired": true,
        "order": 1,
        "conditionalLogic": {
          "showIf": "previous-question-id",
          "condition": "equals",
          "value": "Restaurant"
        }
      }
    ]
  }'
```

### Starting a Response:
```bash
curl -X POST http://localhost:3000/api/questionnaires/questionnaire-id/start \
  -H "Content-Type: application/json" \
  -d '{"customerId": "customer-id"}'
```

### Submitting an Answer:
```bash
curl -X POST http://localhost:3000/api/questionnaires/responses/response-id/answer \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "question-id",
    "answer": "Restaurant",
    "timeSpent": 10
  }'
```

This API provides a complete dynamic questionnaire system that can be easily integrated with the frontend application.
