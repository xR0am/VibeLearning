<div align="center">
  <p>Support the dev with crypto tips, powered by tip.md</p>
  <a href="https://tip.md/xR0am">
    <img src="https://tip.md/badge.svg" alt="Tip in Crypto" width="150">
  </a>
</div>

# VibeLearning

VibeLearning is an advanced AI-powered learning platform that generates personalized developer courses through intelligent repository analysis and adaptive learning techniques, featuring gamified progress tracking and comprehensive error handling.

## 🚀 Features

### Core Learning Platform
- **AI-Powered Course Generation**: Transform GitHub repositories or llms.txt files into comprehensive step-by-step courses
- **Personalized Context**: Tailor generated courses to your specific learning needs and technical requirements
- **Two-Stage Generation Feedback**: Real-time progress updates during course creation ("Generating Course" → "Creating Your Course")
- **Comprehensive Error Handling**: Intelligent error recovery with actionable suggestions for model selection and troubleshooting

### Model Support & Integration
- **OpenRouter Integration**: Access to leading language models including:
  - `google/gemini-2.5-pro-exp-03-25`
  - `deepseek/deepseek-chat-v3-0324:free`
  - `deepseek/deepseek-r1:free`
  - `meta-llama/llama-4-maverick:free`
  - Claude 3.5 Sonnet, GPT-4 Turbo, and many more
- **Smart Model Recommendations**: Context-aware suggestions for optimal model selection based on content size and complexity
- **Scrollable Model Dropdown**: Enhanced UI for browsing extensive model catalog

### Gamified Learning Experience
- **Interactive Progress Tracking**: Visual step completion with celebration animations and progress bars
- **Achievement System**: Unlock badges for learning milestones (First Steps, Course Conqueror, Learning Streak, etc.)
- **Learning Dashboard**: Comprehensive overview of progress, stats, and achievements with motion animations
- **Step-by-Step Visualization**: Color-coded progress states (completed, current, next) with unlock progression

### User Experience & Interface
- **Replit Authentication**: Secure user management with OpenID Connect
- **Form Persistence**: Maintain user inputs during error recovery for seamless retry experience
- **Enhanced Navigation**: Improved back button functionality and browser history management
- **Responsive Design**: Mobile-first approach with tablet and desktop optimization
- **Dark/Light Mode**: Complete theme support with smooth transitions

### Course Management
- **Public/Private Courses**: Share courses with the community or keep them personal
- **Advanced Search & Filtering**: Browse courses by tags, titles, complexity levels, and content
- **Automatic Tagging**: Smart categorization of courses based on content analysis
- **Complexity Analysis**: AI-powered difficulty assessment (Beginner, Intermediate, Advanced, Expert)
- **Course Library**: Searchable repository of user-generated learning content

### Data & Analytics
- **Progress Persistence**: Track completion status, time spent, and learning streaks
- **Achievement Tracking**: Monitor unlocked badges and learning milestones
- **User Statistics**: Comprehensive analytics on learning patterns and course engagement

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** components for consistent design system
- **Framer Motion** for smooth animations and transitions
- **Wouter** for lightweight client-side routing
- **TanStack Query** for efficient data fetching and caching
- **React Hook Form** with Zod validation for form management

### Backend
- **Node.js** with Express.js for server-side logic
- **TypeScript** for end-to-end type safety
- **PostgreSQL** with Neon for scalable database hosting
- **Drizzle ORM** for type-safe database operations
- **OpenID Connect** for secure authentication
- **Express Sessions** with PostgreSQL store

### Development & Deployment
- **Vite** for fast development and optimized builds
- **ESBuild** for efficient bundling
- **Replit** for seamless hosting and deployment
- **Environment-based Configuration** for development/production settings

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- OpenRouter API key for AI model access

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vibelearning
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file with:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   Open `http://localhost:5000` in your browser

### Production Deployment

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

## 🎯 Usage Guide

### Getting Started
1. **Sign In**: Use Replit authentication to access personalized features
2. **Add API Key**: Configure your OpenRouter API key in Profile settings
3. **Choose Source**: Select a GitHub repository or llms.txt file URL
4. **Describe Context**: Specify your learning goals and technical requirements
5. **Select Model**: Choose an appropriate AI model based on complexity needs
6. **Generate Course**: Watch real-time progress as your course is created
7. **Learn & Progress**: Complete steps, earn achievements, and track your journey

### Advanced Features
- **Error Recovery**: When generation fails, receive actionable suggestions and retry with preserved inputs
- **Model Selection**: Use the scrollable dropdown to find models suited to your content size
- **Progress Tracking**: View detailed analytics on your learning dashboard
- **Achievement System**: Unlock badges by completing courses and maintaining learning streaks

## 🏗️ Architecture

### Database Schema
- **Users**: Authentication and profile management
- **Courses**: Generated learning content with metadata
- **Tags**: Categorization and searchability
- **User Progress**: Step completion and analytics tracking
- **Achievements**: Gamification system with user rewards

### API Endpoints
- `/api/courses/generate` - AI-powered course generation
- `/api/courses/public` - Browse community courses
- `/api/courses/user` - Personal course management
- `/api/progress/:courseId` - Learning progress tracking
- `/api/dashboard` - Analytics and achievement data
- `/api/models` - Available AI model catalog

### Security Features
- Secure API key storage with encryption
- CORS protection for cross-origin requests
- Session management with PostgreSQL persistence
- Input validation with Zod schemas
- Rate limiting and error handling

## 🤝 Contributing

We welcome contributions to VibeLearning! Please follow these guidelines:

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow TypeScript strict mode conventions
- Use Prettier for code formatting
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure responsive design principles

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- **OpenRouter** for providing access to cutting-edge language models
- **Neon** for scalable PostgreSQL hosting
- **Replit** for seamless development and deployment platform
- **shadcn/ui** for beautiful, accessible component library
- **The Open Source Community** for the incredible tools and libraries that make this project possible

## 📞 Support

- **Documentation**: Comprehensive guides available in the application's "How To" section
- **Issues**: Report bugs and request features via GitHub Issues
- **Community**: Join discussions and share learning experiences

---
<div align="center">
  <p>Support the dev with crypto tips, powered by tip.md</p>
  <a href="https://tip.md/xR0am">
    <img src="https://tip.md/badge.svg" alt="Tip in Crypto" width="150">
  </a>
</div>

---

**VibeLearning** - Transforming repositories into personalized learning experiences through the power of AI.
