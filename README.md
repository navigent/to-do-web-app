# TaskFlow - Modern Task Management Application

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3+-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

A modern, performant, and intuitive task management application built with Next.js 14, TypeScript, and Tailwind CSS. TaskFlow helps individuals and teams organize, prioritize, and track their daily tasks efficiently.

## 🚀 Features

### Core Functionality
- ✅ **Task CRUD Operations** - Create, read, update, and delete tasks
- 🔍 **Advanced Search** - Real-time search with filters
- 🏷️ **Categories & Tags** - Organize tasks effectively
- 🎯 **Priority Levels** - High, Medium, Low priority assignment
- 📅 **Due Dates** - Set and track deadlines
- ⚡ **Quick Add** - Keyboard shortcut (Cmd/Ctrl + K) for rapid task creation

### User Experience
- 🌓 **Dark/Light Mode** - System-aware theme switching
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ⌨️ **Keyboard Navigation** - Full keyboard control support
- 🔄 **Real-time Updates** - Instant feedback on all actions
- 📊 **Dashboard View** - Quick overview of tasks and statistics

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | [Next.js 14+](https://nextjs.org/) | React framework with App Router |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type safety and better DX |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework |
| **UI Components** | [Shadcn/UI](https://ui.shadcn.com/) | Accessible component library |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight state management |
| **Database** | [SQLite](https://www.sqlite.org/) + [Prisma](https://www.prisma.io/) | Local database with type-safe ORM |
| **Form Handling** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Form validation and management |

## 📋 Prerequisites

- Node.js 18.0 or higher
- npm, yarn, or pnpm package manager
- Git for version control

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database with sample data
npx prisma db seed
```

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🏗️ Project Structure

```
taskflow/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── tasks/         # Task CRUD endpoints
│   ├── (dashboard)/       # Dashboard layout group
│   │   ├── page.tsx       # Dashboard page
│   │   └── tasks/         # Tasks pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Shadcn/UI components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── tasks/            # Task-specific components
├── lib/                   # Utility functions
│   ├── db.ts             # Database client
│   ├── utils.ts          # Helper functions
│   └── validations/      # Zod schemas
├── hooks/                 # Custom React hooks
├── store/                 # Zustand store
├── styles/               # Global styles
├── prisma/               # Database schema
│   └── schema.prisma     # Prisma schema file
└── public/               # Static assets
```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript compiler check |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |

## 🔧 Configuration

### TypeScript Configuration

The project uses strict TypeScript settings. Configuration can be found in `tsconfig.json`.

### ESLint Configuration

ESLint is configured with Next.js recommended rules. See `.eslintrc.json` for details.

### Tailwind Configuration

Tailwind is configured with custom colors and spacing. Check `tailwind.config.ts`.

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy!

### Docker

```bash
# Build the image
docker build -t taskflow .

# Run the container
docker run -p 3000:3000 taskflow
```

## 📖 API Documentation

### Task Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks with filters |
| GET | `/api/tasks/:id` | Get single task |
| POST | `/api/tasks` | Create new task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/toggle` | Toggle task completion |

### Example Request

```typescript
// Create a new task
POST /api/tasks
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "priority": "HIGH",
  "category": "Documentation",
  "dueDate": "2025-06-01T10:00:00Z"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Shadcn/UI](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - For the utility-first CSS
- [Prisma](https://www.prisma.io/) - Next-generation ORM

## 📞 Support

- 📧 Email: support@taskflow.app
- 💬 Discord: [Join our community](https://discord.gg/taskflow)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/taskflow/issues)

---

Built with ❤️ by the TaskFlow Team