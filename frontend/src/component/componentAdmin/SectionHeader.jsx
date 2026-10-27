export function SectionHeader({ title, description }) {
  return (
    <div className="border-b border-border py-3 text-center">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {title}
        </h1>

        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground leading-normal">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
