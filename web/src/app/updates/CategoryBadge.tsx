import { UpdateCategory } from "./updates-data";

interface CategoryBadgeProps {
  category: UpdateCategory;
}

const categoryStyles: Record<UpdateCategory, string> = {
  "New Feature":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Improvement:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Fix: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryStyles[category]}`}
    >
      {category}
    </span>
  );
}
