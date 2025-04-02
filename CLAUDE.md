# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- **Backend**: `cd backend && npm run dev` - Start backend server
- **Frontend**: `cd frontend && npm run dev` - Start development server
- **Frontend Build**: `cd frontend && npm run build` - Build production version
- **Lint**: `cd backend && npm run lint` or `cd frontend && npm run lint` - Run linting
- **Backup Data**: `cd backend && npm run backup-data` - Create data backups

## Code Style Guidelines
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Components**: Functional components with hooks, organized by feature
- **Imports**: Core modules first, then external, then internal
- **Error Handling**: Try/catch with next(error) pattern in backend
- **Documentation**: JSDoc for functions and parameters
- **CSS**: Tailwind utility classes
- **File Structure**: Feature-based organization
- **Testing**: Simple API test scripts in backend's test-*.js files

When editing, match existing patterns in the specific file being modified.