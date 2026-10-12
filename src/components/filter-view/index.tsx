import { Filter } from "@/domains/filter";
import styles from "./index.module.scss";
import { useEffect, useMemo, useState } from "preact/hooks";

type Patch = Partial<Filter>;
type Props = {
  onChange: (patch: Patch) => void;
};

export const FilterView = ({ onChange }: Props) => {
  const [pattern, setPattern] = useState("");
  const [regex, setRegex] = useState<RegExp>(/.*/);
  const [company, setCompany] = useState(false);
  const [short, setShort] = useState(false);
  const [regexError, setRegexError] = useState(false);

  useEffect(() => {
    if (pattern == "") {
      const regex = /.*/;
      setRegex(regex);
      return;
    }

    try {
      const regex = new RegExp(pattern);
      setRegex(regex);
      setRegexError(false);
    } catch (ex) {
      console.warn(`正则表达式构建失败: ${pattern}`, ex);
      setRegexError(true);
    }
  }, [pattern]);

  useEffect(() => {
    const patch: Patch = { regex, company, short };
    onChange(patch);
  }, [regex, company, short]);

  const patternClassName = useMemo(() => {
    const classes: string[] = [styles.pattern];
    if (pattern != "") {
      if (regexError) {
        classes.push(styles.failure);
      } else {
        classes.push(styles.success);
      }
    }
    return classes.join(" ");
  }, [pattern, regexError]);

  return (
    <div className={styles.filter}>
      <div className={styles.regex}>
        <input
          className={patternClassName}
          type="text"
          placeholder="正则表达式"
          value={pattern}
          onChange={(event) => {
            const value = event.currentTarget.value;
            setPattern(value);
          }}
        />
      </div>
      <label className={styles.company}>
        <input
          type="checkbox"
          checked={company}
          onChange={(event) => {
            const checked = event.currentTarget.checked;
            setCompany(checked);
          }}
        />
        &nbsp;
        <span>厂商颜色</span>
      </label>
      <label className={styles.short}>
        <input
          type="checkbox"
          checked={short}
          onChange={(event) => {
            const checked = event.currentTarget.checked;
            setShort(checked);
          }}
        />
        &nbsp;
        <span>缩短名称</span>
      </label>
    </div>
  );
};
