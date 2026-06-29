export function AuthDivider({ label = '또는' }: { label?: string }) {
  return (
    <div className="relative flex items-center">
      <div className="flex-grow border-t border-border" />
      <span className="mx-3 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <div className="flex-grow border-t border-border" />
    </div>
  )
}
