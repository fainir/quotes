# Backend API Service

A professional REST API service built with Node.js, Express, and TypeScript.

## Features

- 🚀 Express & TypeScript
- 🔒 Security with Helmet, CORS, and Rate Limiting
- 🔍 Request Validation
- 📝 Comprehensive Error Handling
- 🔄 API Versioning
- 📊 Request Logging
- ⚡️ Development Hot Reload

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment example file:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your configuration

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Check TypeScript types
- `npm test` - Run tests

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middlewares/    # Custom middlewares
├── models/         # Data models
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript types
├── utils/          # Utility functions
└── index.ts        # App entry point
```

## API Documentation

The API is versioned and all endpoints are prefixed with `/api/v1`.

### Health Check
- GET `/api/v1/health` - Check API status

More endpoints will be documented as they are implemented.

## Development

1. Start the development server:
   ```bash
   npm run dev
   ```
2. The server will be running at `http://localhost:3000`

## Production

1. Build the project:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

## Security

This project implements several security best practices:
- Helmet for secure HTTP headers
- CORS protection
- Rate limiting
- Request validation
- Secure error handling

## Contributing

1. Create a new branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

ISC 