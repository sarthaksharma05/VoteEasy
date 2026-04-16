export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="space-y-3 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted">VoteEasy</p>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground">
          Page not found
        </h1>
        <p className="text-sm text-muted">The page you are looking for does not exist.</p>
      </div>
    </main>
  );
}
