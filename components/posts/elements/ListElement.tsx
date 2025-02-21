import { cn } from "@/lib/utils";

interface ListItem {
  content: string;
}

interface ListData {
  type: string;
  title?: string;
  items: ListItem[] | string[];
}

interface ListElementProps {
  lists: ListData[];
}

export default function ListElement({ lists }: ListElementProps) {
  const isInTable = (items: ListItem[] | string[]): boolean => {
    if (items.length === 0) return false;
    return typeof items[0] !== "string";
  };
  return (
    <div className="space-y-5">
      {lists.map((list, listIndex) => (
        <div
          key={listIndex}
          className={cn(isInTable(list.items) ? "space-y-3" : "space-y-5")}
        >
          {list.title && (
            <h3
              className={cn(
                "text-neutral-primary-text",
                isInTable(list.items)
                  ? "text-subheader-b-16"
                  : "text-subheader-r-16"
              )}
            >
              {list.title}
            </h3>
          )}
          <ul className="space-y-3 ml-[26px] list-disc">
            {list.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                {typeof item === "string" ? (
                  item.includes(":") ? (
                    <>
                      <span className="font-bold">{item.split(":")[0]}:</span>
                      {item.split(":")[1]}
                    </>
                  ) : (
                    item
                  )
                ) : (
                  item.content
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
