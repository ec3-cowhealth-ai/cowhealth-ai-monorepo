import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

interface AppBarProps {
  title: string;
  onBack?: () => void;
  actions?: ReactNode;
}

export const AppBar = ({ title, onBack, actions }: AppBarProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="app-bar">
      <div className="app-bar__left">
        <button className="app-bar__back" onClick={handleBack}>
          ←
        </button>
        <h1 className="app-bar__title">{title}</h1>
      </div>
      {actions && <div className="app-bar__actions">{actions}</div>}
    </header>
  );
};
