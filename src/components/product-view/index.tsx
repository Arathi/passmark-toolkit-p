import { Product } from "../../domains";

type Props = {
  product: Product;
  alt?: boolean;
  index?: number;
  percent?: number;
};

const COLORS: string[] = [
  "pink",
  "yellow",
  "green",
  "light-purple",
  "red",
  "turquoise",
  "orange",
  "brown",
  "purple",
  "blue",
];

export const ProductView = ({
  product,
  alt = false,
  index = 0,
  percent = 0,
}: Props) => {
  const id = `rk${product.id}`;
  const className = alt ? "alt" : undefined;
  const indexClasses: string[] = ["index"];
  const width = `${percent}%`;
  const count = `${product.mark.toLocaleString()}`;

  const colorIndex = index % COLORS.length;
  const color = COLORS[colorIndex];
  if (color != null) {
    indexClasses.push(color);
  }

  return (
    <li id={id} className={className}>
      <span
        className="more_details"
        onClick={(event) => {
          // @ts-ignore
          x(event, ...product.more);
        }}
      >
        &nbsp;
      </span>
      <a href={product.url}>
        <span className="prdname">{product.name}</span>
        <div>
          <span className={indexClasses.join(" ")} style={{ width }}>
            ({width})
          </span>
        </div>
        <span className="count">{count}</span>
        <span className="price-neww">{product.price}</span>
      </a>
    </li>
  );
};
