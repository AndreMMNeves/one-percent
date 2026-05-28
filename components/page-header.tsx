interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
      <div>
        <h1 className="heading text-3xl sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="text-muted mt-1 max-w-2xl">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
