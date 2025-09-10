# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Coach Lia IA** is an AI-powered educational chatbot platform with OpenAI integration and PostgreSQL database support. The application provides personalized learning experiences through interactive courses, real-time chat, and multimedia content delivery.

**Technology Stack**: Node.js/Express backend with vanilla JavaScript frontend, Supabase integration, and Netlify Functions for serverless deployment.

## Development Commands

### Server & Development
```bash
# Start production server
npm start

# Start development server with nodemon
npm run dev

# Start with environment setup (Windows)
npm run dev:win

# Force development mode (kills port 3000 first)
npm run dev:force

# Kill specific ports
npm run port:kill        # Kills port 3000
npm run port:kill:3001   # Kills port 3001
```

### Testing & Quality
```bash
# Run Jest tests
npm test

# Lint JavaScript code
npm run lint

# Format code with Prettier  
npm run format

# Security audit
npm run security-check

# Complete setup (install + security check)
npm run setup
```

### Database Operations
```bash
# Initialize progress database tables
npm run init:database
# or
npm run init:progress

# Extract Supabase configuration
node scripts/extract-supabase-config.js

# Initial project setup
node scripts/setup.js

# Import GenAI questions (if using Supabase)
SUPABASE_URL="your_url" SUPABASE_SERVICE_KEY="your_key" node scripts/import-genai-questions.js --clear --verbose
```

## Architecture Overview

### Core Application Structure
- **`server.js`** - Main Express server with comprehensive security middleware, PostgreSQL connection, and API routing
- **`src/`** - Frontend application with modular component structure
- **`netlify/functions/`** - Serverless functions for authentication, OpenAI integration, and database operations

### Frontend Architecture
The frontend follows a multi-page application (MPA) pattern with shared components:

**Main Pages**:
- `src/index.html` - Landing page with animated hero section and theme switching
- `src/login/new-auth.html` - Authentication system with OTP verification
- `src/chat.html` - Main chat interface with OpenAI integration
- `src/courses.html` / `src/cursos.html` - Course catalog and management
- `src/profile.html` - User profile and progress tracking

**Modular Components**:
- `src/scripts/` - JavaScript modules for animations, theme management, API integration
- `src/styles/` - CSS modules with responsive design and theme system
- `src/utils/` - Utility functions for authentication, email services, and data helpers

### Backend Architecture
**Express Server Features**:
- Helmet.js security middleware with CSP policies
- Rate limiting and CORS configuration
- PostgreSQL connection pooling
- Supabase integration for extended functionality
- Socket.IO for real-time features

**API Structure**:
- RESTful endpoints for user management, courses, and chat
- Netlify Functions for serverless operations
- OpenAI API integration for chat responses
- Email service for OTP verification

### Database Integration
- **Primary**: PostgreSQL with connection pooling
- **Secondary**: Supabase for real-time features and extended functionality
- **Tables**: Users, courses, chat history, progress tracking, OTP verification

## Key Features & Integrations

### AI Chat System
- OpenAI GPT integration through Netlify Functions
- Context-aware conversations with course knowledge
- Real-time message processing with Socket.IO
- Chat history persistence and user context

### Authentication System
- Email-based OTP verification
- JWT token management
- Session persistence with Supabase Auth
- Role-based access control

### Course Management
- Dynamic course data from database
- Progress tracking and analytics
- Interactive multimedia content
- PDF generation and file management

### Theme System
- Dark/light mode with system preference detection
- CSS custom properties for consistent theming
- Animated transitions and particle effects
- Responsive design across all breakpoints

## Development Guidelines

### Environment Configuration
Create `.env` file with required variables:
```
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_key

# Database Configuration
DATABASE_URL=your_postgresql_url

# Server Configuration
PORT=3000
NODE_ENV=development
API_SECRET_KEY=your_api_secret
USER_JWT_SECRET=your_jwt_secret

# Email Configuration (for OTP verification)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_email_password
```

### Frontend Development
- Vanilla JavaScript with ES6+ features
- CSS custom properties for theming
- Responsive-first design approach
- Accessibility compliance (ARIA attributes)

### Backend Development  
- Express.js with modern middleware stack
- Async/await for database operations
- Error handling with proper HTTP status codes
- Security-first approach with CSP and rate limiting

### Deployment Architecture
**Netlify Deployment** (Primary):
- Functions in `netlify/functions/` for serverless API endpoints
- Static site deployment from `src/` directory
- Comprehensive redirect rules in `netlify.toml` for API routing
- Environment variables managed through Netlify UI
- Node.js 18+ runtime environment

**Heroku Deployment** (Alternative):
- `Procfile` configured for Express server deployment
- PostgreSQL add-on support with connection pooling
- Environment variable configuration through Heroku Config Vars
- Suitable for applications requiring persistent server instances

## Testing Strategy

### Jest Configuration
- Test environment: jsdom for DOM testing
- Coverage reporting with HTML output
- Module path mapping with `@/` prefix
- Setup files for test utilities

### Test Structure
```
tests/
  ├── setup.js           # Test environment setup
  ├── __tests__/         # Unit tests
  └── integration/       # Integration tests
```

### Running Specific Tests
```bash
# Run a specific test file
npm test -- tests/__tests__/specific-test.js

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage report
npm test -- --coverage
```

## Security Considerations

### Content Security Policy
- Strict CSP with nonce-based script execution
- External resource whitelisting for CDNs
- Frame ancestors protection
- XSS and injection prevention

### Authentication Security
- JWT token validation
- OTP-based email verification
- Session timeout management
- Rate limiting on auth endpoints

### Data Protection
- Input validation and sanitization
- SQL injection prevention through parameterized queries
- Sensitive data encryption
- CORS configuration for API access

## Performance Optimizations

### Frontend Optimizations
- Resource preloading for critical assets
- CSS and JavaScript minification
- Image optimization and lazy loading
- Particle system with requestAnimationFrame

### Backend Optimizations
- Connection pooling for database
- Response compression with gzip
- Caching strategies for static content
- Rate limiting to prevent abuse

## Common Development Patterns

### API Integration Pattern
```javascript
// Typical API call with error handling
async function apiCall(endpoint, data) {
    try {
        const response = await fetch(`/api/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}
```

### Theme Management Pattern
```javascript
// Theme switching with persistence
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('preferred-theme', newTheme);
}
```

### Animation Pattern
```javascript
// Intersection Observer for scroll animations
const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
};
```

## File Structure Context

### Critical Configuration Files
- `package.json` - Dependencies and npm scripts
- `netlify.toml` - Deployment and redirect configuration with API routing
- `jest.config.js` - Testing framework configuration with jsdom environment
- `server.js` - Express server with security middleware and database connections
- `Procfile` - Heroku deployment configuration (if using Heroku)

### Entry Points
- `server.js` - Backend server entry point
- `src/index.html` - Frontend application entry point
- `src/scripts/main.js` - Frontend JavaScript entry point

### Modular Components
- Authentication: `src/login/`, `src/utils/auth-guard.js`
- Chat System: `src/chat.html`, AI integration in Netlify Functions
- Course System: `src/courses.html`, `src/data/course-data.js`
- UI Components: `src/scripts/` (animations, themes, particles)

## Database Management Scripts

The project includes several utility scripts for database management:

```bash
# Initialize progress tracking database
node scripts/init-progress-database.js

# Setup Zoom integration database tables
node scripts/init-zoom-db.js

# Insert sample activities for testing
node scripts/insert-sample-activities.js

# Run activity data migration
node scripts/run-activity-migration.js

# Test activity functionality
node scripts/test-activities.js
```

## Troubleshooting

### Port Conflicts
If you encounter port conflicts, use the provided port killing scripts:
```bash
# Kill process on port 3000
npm run port:kill

# Kill process on port 3001  
npm run port:kill:3001

# Force start development server (kills port first)
npm run dev:force
```

### Database Connection Issues
1. Verify `.env` file has correct `DATABASE_URL`
2. Ensure PostgreSQL service is running
3. Check Supabase configuration if using Supabase features
4. Run database initialization scripts if tables are missing

### Netlify Functions Debugging
- Functions are located in `netlify/functions/`
- Check function logs in Netlify dashboard
- Verify API redirects in `netlify.toml` match your endpoints
- Test functions locally before deployment