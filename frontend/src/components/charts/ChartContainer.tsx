import type { PropsWithChildren } from "react";

type ChartContainerProps = PropsWithChildren<{
  title: string;
}>;

export const ChartContainer = ({ title, children }: ChartContainerProps) => {
  return (
    <section
      aria-label={title}
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
    >
      <h2 className="mb-3 text-sm font-semibold text-gray-700">{title}</h2>
      <div>{children}</div>
    </section>
  );
};
