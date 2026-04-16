export function Divider() {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-border" />
      <span className="text-sm text-muted">or</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
