import type { PropsWithChildren } from "react";

type ChartContainerProps = PropsWithChildren<{
  title: string;
}>;

export const ChartContainer = ({ title, children }: ChartContainerProps) => {
  return (
    <section aria-label={title} className="card" style={{ padding: "var(--s-4)" }}>
      <h2
        style={{
          marginBottom: "var(--s-3)",
          fontSize: "var(--t-sm)",
          fontWeight: 600,
          color: "var(--text-secondary)",
        }}
      >
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
};
