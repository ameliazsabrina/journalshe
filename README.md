# PKM Journalshe

A comprehensive digital journaling platform for educational institutions, enabling students to submit assignments, receive AI-powered feedback, and track their academic progress through gamified features.

## 🌟 Features

### For Students

- **Assignment Submission**: Submit journal entries and assignments with rich text support
- **AI-Powered Feedback**: Receive instant, intelligent feedback on submissions using OpenAI
- **Progress Tracking**: Monitor academic progress with points and scoring system
- **Login Streaks**: Gamified daily login tracking to encourage consistent engagement
- **Leaderboards**: Class-based ranking system to motivate academic excellence
- **Profile Management**: Personal dashboard with statistics and achievements

### For Teachers

- **Assignment Management**: Create, edit, and manage assignments for multiple classes
- **Student Monitoring**: View and analyze student submissions and progress
- **Class Management**: Organize students by classes and track performance
- **Detailed Analytics**: Access comprehensive statistics on student engagement
- **Submission Review**: Review student work with AI-generated insights

### For Administrators

- **School Management**: Create and manage schools and classes
- **User Administration**: Oversee teacher and student accounts
- **System Configuration**: Manage platform settings and permissions

## 🏗️ Architecture

### Frontend (Client)

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: React hooks and context
- **Authentication**: JWT-based with localStorage
- **HTTP Client**: Axios with interceptors for automatic token handling

### Backend (Server)

- **Runtime**: Cloudflare Workers with Hono framework
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT tokens with bcrypt password hashing
- **AI Integration**: OpenAI API for assignment feedback
- **Deployment**: Cloudflare Workers

### Database Schema

- **Users**: Multi-role system (Student, Teacher, Admin)
- **Schools & Classes**: Hierarchical organization structure
- **Assignments**: Teacher-created tasks with due dates
- **Submissions**: Student responses with AI feedback and scoring
- **Leaderboards**: Point-based ranking system
- **Login Streaks**: Gamification tracking

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun package manager
- Supabase account
- OpenAI API key
- Cloudflare account (for deployment)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd pkm-journalshe
   ```

2. **Install dependencies**

   ```bash
   npm run install:all
   # or
   yarn install:all
   # or
   bun install:all
   ```

3. **Environment Setup**

   **Server Environment** (`server/.env`):

   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   CLIENT_URL=http://localhost:3000
   ```

   **Client Environment** (`client/.env.local`):

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8787
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Create a Supabase project
   - Set up the database schema (tables for Users, Students, Teachers, Schools, Classes, Assignments, Submissions, etc.)
   - Configure Row Level Security (RLS) policies

### Development

**Start both client and server:**

```bash
npm run dev
```

**Start individually:**

```bash
# Client (Next.js) - http://localhost:3000
npm run dev:client

# Server (Hono) - http://localhost:8787
npm run dev:server
```

## 📁 Project Structure

```
pkm-journalshe/
├── client/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   │   ├── admin/     # Admin dashboard and management
│   │   │   ├── student/   # Student portal and features
│   │   │   └── teacher/   # Teacher dashboard and tools
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/        # Base UI components (Radix UI)
│   │   │   ├── admin/     # Admin-specific components
│   │   │   ├── student/   # Student-specific components
│   │   │   └── teacher/   # Teacher-specific components
│   │   └── lib/           # Utilities and API client
│   └── public/            # Static assets
├── server/                # Hono backend API
│   ├── src/
│   │   ├── controller/    # API route handlers
│   │   ├── middleware/    # Authentication and validation
│   │   ├── route/         # Route definitions
│   │   ├── utils/         # Helper functions
│   │   └── types/         # TypeScript type definitions
│   └── wrangler.toml      # Cloudflare Workers configuration
└── package.json           # Root package configuration
```

## 🔐 Authentication & Authorization

### Role-Based Access Control

- **Students**: Can submit assignments, view their progress, and access leaderboards
- **Teachers**: Can create assignments, view student submissions, and manage classes
- **Admins**: Can manage schools, classes, and user accounts

### Security Features

- JWT-based authentication with secure token storage
- Password hashing with bcrypt
- Role-based middleware protection
- CORS configuration for cross-origin requests
- Input validation and sanitization

## 🤖 AI Integration

The platform integrates with OpenAI to provide intelligent feedback on student submissions:

- **Automatic Grading**: AI analyzes submissions and provides scores (0-100)
- **Detailed Feedback**: Constructive comments and suggestions for improvement
- **Instant Response**: Real-time feedback generation upon submission
- **Regeneration**: Teachers and students can request new AI feedback

## 🎮 Gamification Features

### Points System

- Students earn points based on AI-generated scores
- Points contribute to class leaderboards
- Encourages quality submissions and engagement

### Login Streaks

- Daily login tracking with streak counters
- Motivates consistent platform usage
- Streak statistics and achievements

### Leaderboards

- Class-based ranking systems
- Combined scoring from assignments and streaks
- Competitive element to drive engagement

## 🚀 Deployment

### Client Deployment (Vercel)

```bash
cd client
npm run build
# Deploy to Vercel or your preferred platform
```

### Server Deployment (Cloudflare Workers)

```bash
cd server
npx wrangler deploy
```

### Environment Variables for Production

Set the following secrets in Cloudflare Workers:

```bash
npx wrangler secret put JWT_SECRET
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put OPENAI_API_KEY
```

## 📊 API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/register/student` - Student registration
- `POST /api/auth/register/teacher` - Teacher registration

### Student Endpoints

- `GET /api/students/me` - Get current student profile
- `GET /api/students/:id/submissions` - Get student submissions
- `GET /api/students/:id/streaks` - Get login streaks

### Teacher Endpoints

- `GET /api/teachers/me` - Get current teacher profile
- `GET /api/teachers/me/assignments` - Get teacher's assignments
- `GET /api/teachers/me/classes` - Get teacher's classes

### Assignment Endpoints

- `POST /api/assignments` - Create assignment
- `GET /api/assignments/:id` - Get assignment details
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Submission Endpoints

- `POST /api/submissions` - Submit assignment
- `GET /api/submissions/:id` - Get submission details
- `POST /api/submissions/:id/regenerate-feedback` - Regenerate AI feedback

## 🛠️ Development Scripts

```bash
# Install all dependencies
npm run install:all

# Development mode (both client and server)
npm run dev

# Build for production
npm run build

# Clean node_modules and build artifacts
npm run clean

# Individual development
npm run dev:client    # Start Next.js dev server
npm run dev:server    # Start Hono dev server
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Lint code
cd client && npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - React framework for production
- **Hono** - Lightweight web framework for Cloudflare Workers
- **Supabase** - Backend-as-a-Service platform
- **OpenAI** - AI-powered feedback generation
- **Radix UI** - Accessible component library
- **Tailwind CSS** - Utility-first CSS framework
- **Cloudflare Workers** - Serverless computing platform

## 📞 Support

For support, email azakiyasabrina@gmail.com or create an issue in the repository.

---

**PKM Journalshe** - Empowering education through intelligent journaling and gamified learning experiences.
