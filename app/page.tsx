import { TaskManagerDemo } from '@/components/task-manager-demo'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="text-primary">TaskFlow</span>
              </h1>
              <div className="hidden sm:block">
                <p className="text-sm text-muted-foreground">Modern task management made simple</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">Built with Next.js & Shadcn/UI</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-6">
        <TaskManagerDemo />
      </div>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 TaskFlow. Built for productivity.
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>✨ TypeScript</span>
              <span>🎨 Tailwind CSS</span>
              <span>🧩 Shadcn/UI</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
