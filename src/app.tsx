import pino from "pino";
import { CSSProperties, VNode } from "preact";
import { createPortal } from "preact/compat";
import { useEffect, useMemo, useState } from "preact/hooks";

import { Chart, ChartProps } from "./components/chart";
import { Product } from "./domains";

import styles from "./app.module.scss";
import { GM_info } from "$";

const REGEX_ON_CLICK = /x\((.*)\);/;

const log = pino({
  name: "ROOT",
  level: "info",
  transport: {
    target: "pino-pretty",
  },
});

export function App() {
  const [chartPortal, setChartPortal] = useState<VNode<any>>();

  const [original, setOriginal] = useState<HTMLDivElement>();
  const [originalProps, setOriginalProps] = useState<ChartProps>();
  const [displayOriginal, setDisplayOriginal] = useState(true);

  const [enhanced, setEnhanced] = useState<HTMLDivElement>();
  const [displayEnhanced, setDisplayEnhanced] = useState(false);

  // const products = useMemo(() => {
  //   if (originalProps == null) {
  //     return [];
  //   }
  //   return originalProps.products;
  // }, [originalProps]);

  const version = GM_info.script.version;

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (original == null) return;
    const display = displayOriginal ? "block" : "none";
    original.style.display = display;
  }, [original, displayOriginal]);

  useEffect(() => {
    if (enhanced == null) return;
    const display = displayEnhanced ? "block" : "none";
    enhanced.style.display = display;
  }, [enhanced, displayEnhanced]);

  function initialize() {
    const main = document.querySelector<HTMLDivElement>(".main-cmps");
    if (main == null) {
      log.error("找不到main-cmps");
      throw new Error();
    }

    const selector = "div.main#mark > div.chart";
    const original = main.querySelector<HTMLDivElement>(selector);
    if (original == null) {
      log.error(`找不到原始图表 ${selector}`);
      throw new Error();
    }
    setOriginal(original);

    const props = parseChartProps(original);
    log.info("原始图表解析完成");

    initializePortals(main, props);
    log.info("Portal初始化完成");
  }

  function parseChartProps(chart: HTMLDivElement): ChartProps {
    log.info("正在初始化产品列表");

    const chartTitle = chart.querySelector<HTMLDivElement>("div.chart_title");
    if (chartTitle == null) {
      throw new Error();
    }
    const header = chartTitle.innerText;

    const chartSubTitle =
      chart.querySelector<HTMLDivElement>("div.chart_subtitle");
    if (chartSubTitle == null) {
      throw new Error();
    }
    const subtitle = chartSubTitle.innerText;

    const chartSubHeader = chart.querySelector<HTMLDivElement>(
      "div.chart_subheader",
    );
    if (chartSubHeader == null) {
      throw new Error();
    }

    const columns: string[] = [];
    for (const it of chartSubHeader.children) {
      if (
        it.tagName.toLowerCase() == "div" &&
        it.className.startsWith("chart_tabletitle")
      ) {
        const tableTitle = it as HTMLDivElement;
        const column = tableTitle.innerText;
        columns.push(column);
      }
    }

    const chartList = chart.querySelector<HTMLUListElement>("ul.chartlist");
    if (chartList == null) {
      throw new Error();
    }

    const products: Product[] = parseChartList(chartList);

    const props = {
      header,
      subtitle,
      columns,
      products,
    } satisfies ChartProps;
    log.info(props, "产品列表初始化完成");
    return props;
  }

  function parseChartList(list: HTMLUListElement): Product[] {
    const lis = list.querySelectorAll<HTMLLIElement>("li[id]");
    const products: Product[] = [];
    for (const li of lis) {
      const product = parseProduct(li);
      if (product != null) {
        products.push(product);
      }
    }
    return products;
  }

  function parseProduct(item: HTMLLIElement): Product | null {
    const itemId = item.getAttribute("id");
    if (itemId == null) {
      log.warn("li未获取到id");
      return null;
    }
    if (!itemId.startsWith("rk")) {
      log.warn("li的id格式错误");
      return null;
    }

    const id = Number.parseInt(itemId.substring(2));
    if (Number.isNaN(id)) {
      log.warn("id转换失败");
      return null;
    }

    const moreDetails = item.querySelector<HTMLSpanElement>(".more_details");
    if (moreDetails == null) {
      log.warn("more_details获取失败");
      return null;
    }

    const script = moreDetails.getAttribute("onclick");
    if (script == null) {
      log.warn("onclick获取失败");
      return null;
    }
    const more: any[] = [];
    const matches = REGEX_ON_CLICK.exec(script);
    if (matches != null) {
      const params = matches[1].split(",").map((p) => p.trim());
      params.forEach((it, index) => {
        if (index == 0 && it == "event") return;
        const numeric = Number.parseFloat(it);
        const param = Number.isNaN(numeric) ? it : numeric;
        more.push(param);
      });
    }

    const anchor = item.querySelector<HTMLAnchorElement>("a[href]");
    if (anchor == null) {
      log.warn("链接节点获取失败");
      return null;
    }

    const url = anchor.getAttribute("href");
    if (url == null) {
      log.warn("链接获取失败");
      return null;
    }

    const prdname = anchor.querySelector<HTMLSpanElement>(".prdname");
    if (prdname == null) {
      log.warn("prdname获取失败");
      return null;
    }
    const name = prdname.innerText.trim();

    const count = anchor.querySelector<HTMLSpanElement>(".count");
    if (count == null) {
      log.warn("count获取失败");
      return null;
    }

    const mark = Number.parseInt(count.innerText.trim().replace(",", ""));
    if (Number.isNaN(mark)) {
      log.warn("mark转换失败");
      return null;
    }

    const priceNew = anchor.querySelector<HTMLSpanElement>(".price-neww");
    if (priceNew == null) {
      log.warn("price-neww获取失败");
      return null;
    }

    const price = priceNew.innerText;

    return {
      id,
      more,
      url,
      name,
      mark,
      price,
    };
  }

  function initializePortals(main: Element, props: ChartProps) {
    const markChart = main.querySelector("#mark > .chart");
    if (markChart == null) {
      log.warn("找不到原版图表");
      return;
    }

    let container = main.querySelector("#enhanced");
    if (container != null) {
      log.warn("增强图表已存在");
      return;
    }

    container = document.createElement("div");
    container.id = "enhanced";
    main.append(container);

    const chart = <Chart {...props} />;
    const portal = createPortal(chart, container);
    setChartPortal(portal);

    // const value = element.querySelector("#value > .chart");
  }

  return (
    <>
      <div className={styles.app}>
        <div className={styles.version}>v{version}</div>
        <div className={styles["form-item"]}>
          <label>
            <input
              type="checkbox"
              checked={displayOriginal}
              onChange={(event) => {
                const checked = event.currentTarget.checked;
                setDisplayOriginal(checked);
              }}
            />
            &nbsp;
            <span>显示原始图表</span>
          </label>
        </div>
        <div className={styles["form-item"]}>
          <label>
            <input
              type="checkbox"
              checked={displayEnhanced}
              onChange={(event) => {
                const checked = event.currentTarget.checked;
                setDisplayEnhanced(checked);
              }}
            />
            &nbsp;
            <span>显示增强图表</span>
          </label>
        </div>
        <div>
          <button
            type="button"
            onClick={() => {
              const display = !displayEnhanced;
              setDisplayOriginal(!display);
              setDisplayEnhanced(display);
            }}
          >
            切换表单
          </button>
        </div>
      </div>
      {chartPortal}
    </>
  );
}
