import { StatusBadge } from "@components/common";
import { COW_STATUS_VALUES } from "../../../types/cows.ts";

interface CowStatusBadgeProps {
  status: string;
}

const getStatusTone = (status: string): "success" | "warning" | "danger" | "info" | "muted" => {
  switch (status) {
    case COW_STATUS_VALUES.HEALTHY:
      return "success";
    case COW_STATUS_VALUES.HEAT_STRESS:
      return "warning";
    case COW_STATUS_VALUES.ALERT:
      return "danger";
    case COW_STATUS_VALUES.CALVING:
      return "info";
    default:
      return "muted";
  }
};

export const CowStatusBadgeComponent = ({ status }: CowStatusBadgeProps) => {
  return <StatusBadge tone={getStatusTone(status)}>{status}</StatusBadge>;
};
