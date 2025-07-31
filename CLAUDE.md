# Family Expense Tracker - Project Documentation

## Project Overview
A simple, family-focused expense tracking web application that allows multiple family members to log and share their spending. Built with React frontend and Node.js backend, using Firebase Firestore for cloud data storage.

## Architecture
- **Frontend**: React 18 with Tailwind CSS for responsive design
- **Backend**: Node.js with Express.js REST API
- **Database**: Firebase Firestore (NoSQL cloud database)
- **Authentication**: JWT tokens with bcrypt PIN hashing
- **Deployment**: Ready for Vercel, Render, Railway, or self-hosting

## Key Features
- Multi-user family accounts with PIN authentication
- Real-time expense logging with categories
- Shared expense viewing across all family members
- Dashboard with spending summaries and analytics
- Mobile-responsive design for phones and tablets
- Color-coded family members for easy identification

## Project Structure
```
internal_finance/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   └── Navigation.js
│   │   ├── pages/          # Main application pages
│   │   │   ├── Login.js    # User authentication
│   │   │   ├── Dashboard.js # Main overview
│   │   │   ├── AddExpense.js # Expense entry form
│   │   │   └── ExpenseList.js # All expenses view
│   │   ├── services/       # API communication
│   │   │   └── api.js      # Axios API service
│   │   └── utils/          # Helper functions
│   ├── public/             # Static assets
│   └── package.json        # Dependencies and scripts
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   │   └── firebase.js # Firebase setup
│   │   ├── routes/         # API endpoints
│   │   │   ├── auth.js     # Authentication routes
│   │   │   ├── expenses.js # Expense CRUD operations
│   │   │   └── users.js    # User management
│   │   ├── middleware/     # Request processing
│   │   │   └── auth.js     # JWT token verification
│   │   └── server.js       # Express app entry point
│   ├── .env                # Environment variables
│   ├── package.json        # Dependencies and scripts
│   └── vercel.json         # Vercel deployment config
├── DEPLOYMENT.md           # Deployment instructions
├── FIREBASE_SETUP.md       # Firebase configuration guide
└── README.md               # Project setup instructions
```

## Development Commands

### Setup
```bash
# Install all dependencies
npm run setup

# Start development servers
npm run dev                 # Runs both frontend and backend
npm run frontend           # Frontend only (port 3000)
npm run backend            # Backend only (port 5000)
```

### Frontend Commands
```bash
cd frontend
npm start                  # Development server
npm run build             # Production build
npm test                  # Run tests
```

### Backend Commands
```bash
cd backend
npm run dev               # Development with nodemon
npm start                 # Production server
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new family member account
- `POST /api/auth/login` - Sign in with name and PIN

### Expenses
- `POST /api/expenses` - Add new expense
- `GET /api/expenses` - Get all family expenses (recent 100)
- `GET /api/expenses/range?start=DATE&end=DATE` - Get expenses by date range
- `GET /api/expenses/summary` - Get spending summary by family member (last 30 days)

### Users
- `GET /api/users` - Get all family members

## Database Schema (Firestore Collections)

### Users Collection
```javascript
{
  name: string,           // Family member name
  pin: string,            // Hashed PIN for authentication
  color: string,          // Hex color for UI identification
  createdAt: timestamp    // Account creation date
}
```

### Expenses Collection  
```javascript
{
  userId: string,         // Reference to user document ID
  amount: number,         // Expense amount (float)
  description: string,    // What was purchased
  category: string,       // Expense category (Food, Transport, etc.)
  date: timestamp,        // When expense occurred
  createdAt: timestamp    // When record was created
}
```

## Environment Variables

### Backend (.env)
```bash
JWT_SECRET=your-jwt-secret-key
PORT=5000
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

### Frontend (.env.production)
```bash
REACT_APP_API_URL=https://your-backend-url.com
```

## Security Features
- PIN-based authentication with bcrypt hashing
- JWT token-based session management
- Input validation and sanitization
- CORS configuration for API security
- Firebase security rules (optional)

## Deployment Options
1. **Vercel** - Recommended for free hosting
2. **Render.com** - Alternative free option
3. **Railway.app** - Simple paid hosting
4. **Firebase Hosting** - Google's platform
5. **Self-hosted VPS** - Full control option

## Testing Approach
- Manual testing during development
- Form validation testing
- API endpoint testing
- Cross-browser compatibility testing
- Mobile responsiveness testing

## Performance Considerations
- React component optimization with proper state management
- API response caching where appropriate
- Image optimization for production builds
- Bundle size optimization with tree shaking
- Lazy loading for improved initial load times

## Future Enhancement Ideas
- Receipt photo uploads
- Expense categories customization
- Budget setting and alerts
- Monthly/yearly reports with charts
- Export to CSV/PDF
- Push notifications for expenses
- Recurring expense templates
- Multi-currency support

## Development Notes
- Uses functional React components with hooks
- Responsive design with Tailwind CSS utilities
- RESTful API design patterns
- Async/await for all database operations
- Error handling with try/catch blocks
- Consistent code formatting and naming conventions

## Troubleshooting Common Issues
- **Firebase connection errors**: Check service account key configuration
- **CORS issues**: Verify frontend URL in backend CORS settings
- **Authentication failures**: Ensure JWT_SECRET matches between requests
- **Build failures**: Check all environment variables are set correctly
- **Database query errors**: Verify Firestore indexes are created

## Contributing Guidelines
- Follow existing code style and patterns
- Test all changes locally before deployment
- Update documentation for new features
- Use meaningful commit messages
- Keep components small and focused on single responsibility