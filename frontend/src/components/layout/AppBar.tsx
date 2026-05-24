import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

interface AppBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  left?: ReactNode;
  actions?: ReactNode;
}

export const AppBar = ({
  title,
  subtitle,
  showBack,
  onBack,
  left,
  actions,
}: AppBarProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <header className="app-bar">
      <div className="app-bar__left">
        {left ? (
          left
        ) : showBack ? (
          <button
            className="app-bar__back"
            onClick={handleBack}
            aria-label="Voltar"
          >
            <ChevronLeft size={20} />
          </button>
        ) : null}
        <div className="app-bar__titles">
          <h1 className="app-bar__title">{title}</h1>
          {subtitle && <p className="app-bar__subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="app-bar__actions">{actions}</div>}
    </header>
  );
};
