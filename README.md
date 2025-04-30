# DevCourse

DevCourse is an advanced AI-powered learning platform that generates personalized developer courses through intelligent repository analysis and adaptive learning techniques.

## 🚀 Features

- **AI-Powered Course Generation**: Upload GitHub repositories or llms.txt files and let AI transform them into comprehensive step-by-step courses.
- **Personalized Context**: Tailor the generated courses to your specific learning needs by providing custom context.
- **Free OpenRouter Models**: Support for leading open-source models including:
  - `google/gemini-2.5-pro-exp-03-25`
  - `deepseek/deepseek-chat-v3-0324:free`
  - `deepseek/deepseek-r1:free`
  - `meta-llama/llama-4-maverick:free`
- **User Authentication**: Secure access with Replit authentication for managing personal courses.
- **Public/Private Courses**: Choose to share your generated courses with the community or keep them private.
- **Searchable Course Library**: Browse, search, and filter courses by tags, titles, or content.
- **Immersive Learning Experience**: Enjoy a clean, distraction-free interface designed for focused learning.

## 🖥️ Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: OpenID Connect with Replit
- **API Integration**: OpenRouter for accessing various LLM models

## 🏗️ Architecture

The application follows a modern full-stack architecture:

- **Client**: React SPA with TanStack Query for data fetching
- **Server**: Express.js REST API
- **Database**: PostgreSQL database with Drizzle ORM
- **Authentication**: Replit Auth via OpenID Connect

## 🚦 Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL database
- OpenRouter API key

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```
DATABASE_URL=<your_postgresql_connection_string>
SESSION_SECRET=<your_session_secret>
OPENROUTER_API_KEY=<your_openrouter_api_key>
```

4. Run migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

## 🔑 API Key Setup

DevCourse uses a "bring your own API key" approach for OpenRouter integration:

1. Create an account at [OpenRouter](https://openrouter.ai)
2. Generate an API key
3. Add your API key in the user profile settings within the app

## 📚 Usage Guide

### Generating a Course

1. Log in using your Replit account
2. Enter a GitHub repository URL or llms.txt URL in the input form
3. Choose your context/purpose for the course
4. Select a model from the available options
5. Choose whether to make the course public or private
6. Click Generate Course

### Browsing the Public Library

- Use the search bar to find courses by title, repository, or context
- Filter courses by topic using the tag system
- Click on any course card to view the full course content

### Managing Your Courses

- Access your personal courses from the "Your Courses" section
- View both your private and public courses
- Select any course to continue learning

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.