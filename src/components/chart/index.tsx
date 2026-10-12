import { ComponentChildren } from "preact";
import { useState } from "preact/hooks";

import { ChartList } from "@/components/chart-list";
import { FilterView } from "@/components/filter-view";
import type { Product, Filter } from "@/domains";

type Props = {
  header: string;
  subtitle: string;
  columns: string[];
  products: Product[];
};

export const Chart = ({
  header,
  subtitle,
  columns = [],
  products = [],
}: Props) => {
  const [filter, setFilter] = useState<Filter>({});

  const tableTitles: ComponentChildren[] = [];
  columns.forEach((column, index) => {
    const className = `chart_tabletitle${index + 1}`;
    tableTitles.push(
      <div key={`column-${index + 1}`} className={className}>
        {column}
      </div>,
    );
  });

  return (
    <div className="chart">
      <div className="chart_header">
        <div className="chart_title">{header}</div>
        <div className="chart_subtitle">{subtitle}</div>
      </div>
      <FilterView
        onChange={(patch) => {
          console.info("过滤器发生变动：", patch);
          setFilter({
            ...filter,
            ...patch,
          });
        }}
      />
      <div className="chart_subheader">{tableTitles}</div>
      <div className="chart_body">
        <ChartList products={products} filter={filter} />
      </div>
    </div>
  );
};

export type { Props as ChartProps };
