import { TaskManagerDemo } from '@/components/task-manager-demo'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-full sm:max-w-6xl">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all duration-300" />
                  <div className="relative bg-gradient-to-br from-primary to-primary/80 p-2 rounded-xl shadow-lg">
                    <svg className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  TaskFlow
                </h1>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
              >
                Login
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-3 sm:py-6">
        <TaskManagerDemo />
      </div>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-12">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 max-w-full sm:max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              © 2025 TaskFlow. Built for productivity.
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-muted-foreground">
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
