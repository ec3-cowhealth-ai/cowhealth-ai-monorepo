import { StatusBadge } from "@components/common";
import { CowStatusValues } from "../../../types/cows.ts";

interface CowStatusBadgeProps {
  status: string;
}

const getStatusTone = (
  status: string,
): "success" | "warning" | "danger" | "info" | "muted" => {
  switch (status) {
    case CowStatusValues.HEALTHY:
      return "success";
    case CowStatusValues.HEAT_STRESS:
      return "warning";
    case CowStatusValues.ALERT:
      return "danger";
    case CowStatusValues.CALVING:
      return "info";
    default:
      return "muted";
  }
};

export const CowStatusBadgeComponent = ({ status }: CowStatusBadgeProps) => {
  return <StatusBadge tone={getStatusTone(status)}>{status}</StatusBadge>;
};
