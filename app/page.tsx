export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-4xl text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight">
          Welcome to <span className="text-primary">TaskFlow</span>
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Your modern task management solution powered by Next.js and Tailwind CSS v4
        </p>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button className="btn-primary">
            Get Started
          </button>
          <button className="btn-secondary">
            Learn More
          </button>
        </div>
        
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <div className="task-card">
            <h2 className="mb-2 text-lg font-semibold">✨ Modern Stack</h2>
            <p className="text-sm text-muted-foreground">
              Built with Next.js 14, TypeScript, and Tailwind CSS v4
            </p>
          </div>
          
          <div className="task-card">
            <h2 className="mb-2 text-lg font-semibold">🚀 Fast & Responsive</h2>
            <p className="text-sm text-muted-foreground">
              Optimized performance with responsive design
            </p>
          </div>
          
          <div className="task-card">
            <h2 className="mb-2 text-lg font-semibold">🎨 Beautiful UI</h2>
            <p className="text-sm text-muted-foreground">
              Clean interface with dark mode support
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}