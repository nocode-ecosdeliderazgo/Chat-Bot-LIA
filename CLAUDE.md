# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm start` - Start the server (runs server.js)
- `npm run dev` - Start development server with nodemon
- `npm test` - Run Jest tests
- `npm run lint` - Lint JavaScript files in src/
- `npm run format` - Format code with Prettier
- `npm run security-check` - Run npm audit and fix vulnerabilities
- `npm run setup` - Install dependencies and run security check

### Testing
- Tests are configured with Jest using jsdom environment
- Test files: `**/__tests__/**/*.js` or `**/?(*.)+(spec|test).js`
- Coverage reports generated in `coverage/` directory
- Setup file: `tests/setup.js`

## Project Architecture

### Application Structure
This is a full-stack educational chatbot application with:

**Backend (server.js):**
- Express.js server with comprehensive security middleware
- JWT-based authentication with session fingerprinting
- PostgreSQL database integration for course content and user data
- OpenAI API integration for AI responses
- Rate limiting, CORS, and Helmet security headers
- File upload support with Multer
- **Socket.IO integration for real-time livestream chat functionality**

**Netlify Functions (Production Deployment):**
- Serverless functions in `netlify/functions/` and `src/netlify/functions/`
- PostgreSQL integration with environment variables
- bcrypt password hashing for security
- CORS configuration for cross-origin requests
- Dual deployment strategy for redundancy

**Frontend:**
- Vanilla JavaScript (ES6+) in `src/scripts/main.js`
- Modern CSS with responsive design in `src/styles/main.css`
- Login system in `src/login/`
- Main chat interface in `src/chat.html`
- **Real-time livestream chat interface integrated in the sidebar**

### Key Components

**Chat System (`src/scripts/main.js`):**
- Chatbot configuration with OpenAI GPT-4 integration
- Real-time typing simulation and message handling
- Audio features with welcome sounds
- Conversation history and state management
- Dynamic API key loading from backend
- **Real-time livestream chat with Socket.IO client integration**

**Livestream Chat Features:**
- Real-time messaging between all connected users
- Automatic username generation
- Connection status indicators
- User count display
- Message history (last 50 messages)
- Responsive design with custom scrollbars
- System notifications for user join/leave events

**Authentication System:**
- **Flexible Login**: Users can authenticate with either email OR username
- **Password Requirements**: Minimum 8 characters with validation
- **Schema Consistency**: Unified user schema across local and production environments
- **Error Handling**: Comprehensive validation and user-friendly error messages
- **Session Management**: JWT tokens with session fingerprinting

**Security Implementation:**
- Environment variables for sensitive data (API keys, database URLs)
- bcrypt password hashing with salt rounds
- API key authentication for all endpoints
- Content Security Policy and security headers
- Parameterized SQL queries to prevent injection
- CORS configuration for production domains

**Database Schema:**
- PostgreSQL with tables for course content, users, conversations, and sessions
- Content categorization by difficulty and topic
- User progress tracking and conversation history

### Configuration Files
- `jest.config.js` - Jest testing configuration with jsdom environment
- `package.json` - Dependencies and npm scripts (includes Socket.IO)
- `netlify.toml` - Netlify deployment configuration and function routing
- Environment variables expected in `.env` file (see docs/SECURITY.md)

### Netlify Functions Architecture

**Function Locations:**
- **Primary**: `netlify/functions/` (used in production)
- **Backup**: `src/netlify/functions/` (development and redundancy)

**Available Functions:**
- `register.js` - User registration with email/username validation
- `login.js` - Authentication supporting email OR username
- `auth-issue.js` - Authentication issue handling
- `cors-utils.js` - Shared CORS configuration
- `context.js` - Application context management
- `openai.js` - OpenAI API integration
- `test.js` - Function testing utilities

**Function Features:**
- **Database Integration**: PostgreSQL with connection pooling
- **Security**: bcrypt password hashing, input validation
- **Error Handling**: Comprehensive error responses with proper HTTP status codes
- **CORS Support**: Cross-origin requests for production domains
- **Schema Flexibility**: Dynamic column detection for database compatibility

### Important Notes
- The application uses a security-first approach with multiple layers of protection
- Database connections and OpenAI API keys are loaded dynamically from environment variables
- Frontend does not store sensitive credentials - all API calls go through authenticated backend endpoints
- The chatbot is configured as "Asistente de Aprende y Aplica IA" (AI Learning Assistant)
- Audio features are integrated but optional for users
- **Real-time chat functionality uses Socket.IO with CORS configured for development**
- **Livestream chat is accessible in the collapsible livestream section of the sidebar**
- **Chat messages are limited to 200 characters and 50 messages history**

### Development Workflow

**Local Development:**
1. Set up environment variables (see docs/SECURITY.md for required variables)
2. Run `npm run setup` to install dependencies and check security
3. Use `npm run dev` for development with auto-restart
4. Run `npm test` to execute the test suite
5. Use `npm run lint` and `npm run format` to maintain code quality

**Production Deployment:**
1. Ensure both function directories are synchronized
2. Commit and push changes to Git repository
3. Netlify automatically deploys from Git
4. Monitor function logs in Netlify dashboard
5. Test authentication endpoints in production

**Testing Authentication:**
```bash
# Test registration (local)
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","username":"testuser","email":"test@example.com","password":"password123"}'

# Test login with email (production)
curl -X POST https://yourdomain.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"password123"}'

# Test login with username (production)
curl -X POST https://yourdomain.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

**Function Development Best Practices:**
- Always test locally with `npm start` before deployment
- Keep both function directories synchronized
- Use consistent database schema across environments
- Validate all input parameters
- Implement proper error handling with HTTP status codes
- Test both email and username authentication flows

### New Features Added
**Real-time Livestream Chat:**
- Added Socket.IO dependency for real-time communication
- Implemented server-side Socket.IO handlers for chat functionality
- Created responsive chat interface in the livestream section
- Added comprehensive CSS styling for chat components
- Integrated automatic username generation and user management
- Added connection status indicators and user count display
- Implemented message history with 50-message limit
- Added system notifications for user join/leave events

### Deployment Environments

**Local Development:**
- Express.js server on `localhost:3000`
- Direct PostgreSQL connection
- Full server.js functionality
- Hot reload with nodemon

**Production (Netlify):**
- Serverless Netlify Functions
- Environment variables for database connection
- Optimized for static site deployment
- Auto-deployment from Git repository

### Common Issues and Solutions

**Error 400 "Datos de registro inválidos":**
- **Cause**: Missing required fields or type_rol validation
- **Solution**: Ensure all required fields are provided, type_rol is now optional
- **Files affected**: `netlify/functions/register.js`, `src/netlify/functions/register.js`

**Error 500 "Internal Server Error":**
- **Cause**: Database schema mismatch between local and production
- **Solution**: Updated functions to use consistent schema (display_name vs full_name)
- **Fix applied**: Both function directories synchronized

**Login only works with username, not email:**
- **Cause**: SQL query only checked username field
- **Solution**: Modified query to check `WHERE username = $1 OR email = $1`
- **Files affected**: `netlify/functions/login.js`, `src/netlify/functions/login.js`

**Netlify Functions not found:**
- **Cause**: Functions in wrong directory or netlify.toml misconfiguration
- **Solution**: Maintain dual directories, netlify.toml points to `netlify/functions/`
- **Best practice**: Keep both directories synchronized

### Database Schema Requirements

**User Table Structure:**
```sql
users (
  id SERIAL PRIMARY KEY,
  username VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  display_name VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
)
```

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins
- Other variables as documented in `docs/SECURITY.md`

### Documentation
- Comprehensive security documentation in `docs/SECURITY.md`
- Database structure defined in `docs/DATABASE_STRUCTURE.md`
- Setup instructions in `PROJECT_SETUP.md`
- Login implementation details in `LOGIN_IMPLEMENTATION.md`