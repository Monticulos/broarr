import type { Event } from "../../types/event";
import styles from "./CategoryBadge.module.css";

const LABELS: Record<Event["category"], string> = {
  kultur: "Kultur",
  sport: "Sport",
  næringsliv: "Næringsliv",
  kommunalt: "Kommunalt",
  annet: "Annet",
};

interface Props {
  category: Event["category"];
}

export default function CategoryBadge({ category }: Props) {
  return (
    <span className={`${styles.badge} ${styles[category]}`}>
      {LABELS[category]}
    </span>
  );
}
