# Paramount Launchpad Frontend

React.js frontend for the AI-powered liquor wholesale onboarding system, built with TypeScript and following clean architecture principles.

## Architecture

This frontend follows clean architecture with clear separation of concerns:

- **Presentation Layer**: React components, pages, and UI elements
- **Domain Layer**: Business entities and repository interfaces
- **Data Layer**: API clients and repository implementations

### Clean Architecture Benefits

- **Testability**: Easy to unit test business logic
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new features
- **Independence**: UI and business logic are decoupled

## Features

- Customer registration and onboarding flow
- AI-powered product curation
- Responsive design with Tailwind CSS
- Type-safe API integration
- Form validation with React Hook Form
- Modern React patterns with hooks

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **State Management**: React hooks (can be extended with Zustand)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3001`

## Project Structure

```
src/
├── domain/                 # Domain layer
│   ├── entities/          # Business entities
│   └── repositories/      # Repository interfaces
├── data/                  # Data layer
│   ├── api/              # API client
│   └── repositories/      # Repository implementations
├── presentation/          # Presentation layer
│   ├── components/       # Reusable components
│   │   ├── ui/          # Basic UI components
│   │   ├── customer/    # Customer-related components
│   │   ├── onboarding/  # Onboarding flow components
│   │   └── product/     # Product-related components
│   └── pages/           # Page components
└── shared/              # Shared utilities
```

## Components

### UI Components
- `Button` - Customizable button component
- `Input` - Form input with validation
- `Select` - Dropdown select component
- `Card` - Container component
- `ProgressBar` - Progress indicator

### Feature Components
- `CustomerRegistration` - Customer signup form
- `OnboardingFlow` - Multi-step onboarding process
- `ProductCard` - Product display component

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Use functional components with hooks
- Implement proper error boundaries
- Use semantic HTML elements

## API Integration

The frontend communicates with the backend through:

- **API Client**: Centralized HTTP client with interceptors
- **Repositories**: Abstract data access layer
- **Type Safety**: Full TypeScript integration

### Example Usage

```typescript
// Using a repository
const customerRepository = new CustomerRepository();
const customer = await customerRepository.createCustomer({
  email: 'test@example.com',
  name: 'Test Business',
  venueType: VenueType.RESTAURANT,
  location: { /* ... */ }
});
```

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Design System**: Consistent colors and spacing
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliant components

## State Management

Currently using React hooks for state management. Can be extended with:

- **Zustand**: Lightweight state management
- **React Query**: Server state management
- **Context API**: For global state

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service

## Contributing

1. Follow the established architecture patterns
2. Write TypeScript interfaces for all data structures
3. Use semantic commit messages
4. Test components thoroughly
5. Follow accessibility guidelines
