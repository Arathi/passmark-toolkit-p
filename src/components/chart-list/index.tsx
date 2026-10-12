import { ComponentChildren } from "preact";
import { useMemo } from "preact/hooks";

import { ProductView } from "@/components/product-view";
import { Product } from "@/domains";
import { Filter } from "@/domains/filter";

type Props = {
  products?: Product[];
  filter?: Filter;
};

export const ChartList = ({ products = [], filter = {} }: Props) => {
  const filtered = useMemo(() => {
    const { regex } = filter;
    const items: Product[] = [];
    if (regex != null) {
      products.forEach((product) => {
        const matches = regex.exec(product.name);
        if (matches != null) {
          items.push(product);
        }
      });
    } else {
      items.push(...products);
    }
    return items;
  }, [products, filter]);

  const items = useMemo(() => {
    const views: ComponentChildren[] = [];
    if (filtered.length == 0) {
      return views;
    }

    const top = filtered[0].mark;

    filtered.forEach((product, index) => {
      const percent = Math.floor((product.mark * 86) / top);
      views.push(
        <ProductView
          key={product.id}
          product={product}
          index={index}
          percent={percent}
        />,
      );
    });
    return views;
  }, [filtered]);

  return <ul className="chartlist">{items}</ul>;
};
