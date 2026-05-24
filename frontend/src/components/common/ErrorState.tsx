import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const ErrorState = ({
  icon = <AlertTriangle size={40} />,
  title,
  description,
  action,
}: ErrorStateProps) => {
  return (
    <div className="error-state">
      <div className="error-state__icon">{icon}</div>
      <h3 className="error-state__title">{title}</h3>
      {description && <p className="error-state__description">{description}</p>}
      {action && <div className="error-state__action">{action}</div>}
    </div>
  );
};
