import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListSection as ListSectionType } from "@/types/editor";
import { Plus, Trash } from "lucide-react";
import { BaseSection } from "./base-section";

interface ListSectionProps {
  section: ListSectionType;
  onUpdate: (id: string, updates: Partial<ListSectionType>) => void;
  onDelete: (id: string) => void;
}

export function ListSection({ section, onUpdate, onDelete }: ListSectionProps) {
  const addList = () => {
    const lists = [...(section.lists || [])];
    lists.push({ title: "", items: [""] });
    onUpdate(section.id, { lists });
  };

  const updateListTitle = (index: number, title: string) => {
    const lists = [...(section.lists || [])];
    lists[index].title = title;
    onUpdate(section.id, { lists });
  };

  const addListItem = (listIndex: number) => {
    const lists = [...(section.lists || [])];
    lists[listIndex].items.push("");
    onUpdate(section.id, { lists });
  };

  const updateListItem = (
    listIndex: number,
    itemIndex: number,
    content: string
  ) => {
    const lists = [...(section.lists || [])];
    lists[listIndex].items[itemIndex] = content;
    onUpdate(section.id, { lists });
  };

  const removeListItem = (listIndex: number, itemIndex: number) => {
    const lists = [...(section.lists || [])];
    lists[listIndex].items.splice(itemIndex, 1);
    onUpdate(section.id, { lists });
  };

  const removeList = (index: number) => {
    const lists = [...(section.lists || [])];
    lists.splice(index, 1);
    onUpdate(section.id, { lists });
  };

  return (
    <BaseSection section={section} title="List Section" onDelete={onDelete}>
      <div className="space-y-6">
        {/* Section Title */}
        <div className="space-y-2">
          <Label>Section Title</Label>
          <Input
            value={section.title || ""}
            onChange={(e) => onUpdate(section.id, { title: e.target.value })}
            placeholder="Enter section title..."
          />
        </div>

        {/* Lists */}
        <div className="space-y-6">
          {(section.lists || []).map((list, listIndex) => (
            <div key={listIndex} className="space-y-4">
              {/* List Title and Remove List Button */}
              <div className="flex items-center gap-2">
                <Input
                  value={list.title}
                  onChange={(e) => updateListTitle(listIndex, e.target.value)}
                  placeholder="Enter list title..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeList(listIndex)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>

              {/* List Items */}
              <div className="space-y-3 pl-4">
                {list.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2.5" />
                    <Input
                      value={item}
                      onChange={(e) =>
                        updateListItem(listIndex, itemIndex, e.target.value)
                      }
                      placeholder="Enter list item..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeListItem(listIndex, itemIndex)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Add Item Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addListItem(listIndex)}
                  className="ml-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
          ))}

          {/* Add List Button */}
          <Button type="button" variant="outline" onClick={addList}>
            <Plus className="h-4 w-4 mr-2" />
            Add List
          </Button>
        </div>
      </div>
    </BaseSection>
  );
}
