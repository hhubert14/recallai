import { UpdateCategory, categoryColors } from "./updates-data";

interface CategoryBadgeProps {
  category: UpdateCategory;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[category]}`}
    >
      {category}
    </span>
  );
}
