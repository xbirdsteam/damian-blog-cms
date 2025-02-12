import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  TableSection as TableSectionType,
  CellContent,
  ListItem,
  NestedList,
} from "@/types/editor";
import { Plus, Trash } from "lucide-react";
import { BaseSection } from "./base-section";

interface TableSectionProps {
  section: TableSectionType;
  onUpdate: (id: string, updates: Partial<TableSectionType>) => void;
  onDelete: (id: string) => void;
}

function ListItemEditor({
  item,
  onChange,
  onRemove,
}: {
  item: ListItem;
  onChange: (value: ListItem) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        value={item.content}
        onChange={(e) => onChange({ content: e.target.value })}
        placeholder="Enter item text..."
        className="text-sm"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash className="h-3 w-3" />
      </Button>
    </div>
  );
}

function ListEditor({
  list,
  onChange,
  onRemove,
}: {
  list: NestedList;
  onChange: (value: NestedList) => void;
  onRemove: () => void;
}) {
  const addItem = () => {
    const items = [...list.items, { content: "" }];
    onChange({ ...list, items, type: "bullet" });
  };

  return (
    <div className="space-y-3 bg-muted/30 rounded-md p-4">
      <div className="flex items-center justify-between gap-2">
        <Input
          value={list.title || ""}
          onChange={(e) => onChange({ ...list, title: e.target.value })}
          placeholder="List title (optional)"
          className="max-w-[200px] text-sm"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3 pl-4">
        {list.items.map((item, idx) => (
          <ListItemEditor
            key={idx}
            item={item}
            onChange={(value) => {
              const newItems = [...list.items];
              newItems[idx] = value;
              onChange({ ...list, items: newItems });
            }}
            onRemove={() => {
              const newItems = [...list.items];
              newItems.splice(idx, 1);
              onChange({ ...list, items: newItems });
            }}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Item
        </Button>
      </div>
    </div>
  );
}

function TableCellEditor({
  content,
  onChange,
}: {
  content: CellContent;
  onChange: (value: CellContent) => void;
}) {
  const addList = () => {
    const lists = [...(content.lists || [])];
    lists.push({
      type: "bullet",
      title: "",
      items: [{ content: "" }],
    });
    onChange({ ...content, lists });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Select
          value={content.type}
          onValueChange={(value: "text" | "list") =>
            onChange({ ...content, type: value })
          }
        >
          <SelectTrigger className="w-[100px] h-8 text-xs">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="list">List</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {content.type === "text" && (
        <Textarea
          value={content.content || ""}
          onChange={(e) => onChange({ ...content, content: e.target.value })}
          placeholder="Enter text..."
          className="min-h-[80px] text-sm"
        />
      )}

      {content.type === "list" && (
        <div className="space-y-4">
          {(content.lists || []).map((list, idx) => (
            <ListEditor
              key={idx}
              list={list}
              onChange={(value) => {
                const lists = [...(content.lists || [])];
                lists[idx] = value;
                onChange({ ...content, lists });
              }}
              onRemove={() => {
                const lists = [...(content.lists || [])];
                lists.splice(idx, 1);
                onChange({ ...content, lists });
              }}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addList}
            className="w-full text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add List
          </Button>
        </div>
      )}
    </div>
  );
}

export function TableSection({
  section,
  onUpdate,
  onDelete,
}: TableSectionProps) {
  const addColumn = () => {
    const newKey = `column${section.columns.length + 1}`;
    onUpdate(section.id, {
      columns: [...section.columns, { header: "", key: newKey }],
      rows: [
        {
          ...section.rows[0],
          [newKey]: { type: "text" },
        },
      ],
    });
  };

  const updateHeader = (index: number, value: string) => {
    const newColumns = [...section.columns];
    newColumns[index] = { ...newColumns[index], header: value };
    onUpdate(section.id, { columns: newColumns });
  };

  const updateCell = (key: string, value: CellContent) => {
    onUpdate(section.id, {
      rows: [
        {
          ...section.rows[0],
          [key]: value,
        },
      ],
    });
  };

  const removeColumn = (index: number) => {
    if (section.columns.length <= 2) return;
    const newColumns = section.columns.filter((_, i) => i !== index);
    const columnKey = section.columns[index].key;
    const { [columnKey]: removed, ...rest } = section.rows[0];
    onUpdate(section.id, {
      columns: newColumns,
      rows: [rest],
    });
  };

  // Initialize if empty
  if (section.columns.length === 0) {
    onUpdate(section.id, {
      columns: [
        { header: "", key: "column1" },
        { header: "", key: "column2" },
      ],
      rows: [
        {
          column1: { type: "text" },
          column2: { type: "text" },
        },
      ],
    });
  }

  return (
    <BaseSection section={section} title="Table Section" onDelete={onDelete}>
      <div className="space-y-6">
        {/* Table Title */}
        <div className="space-y-2">
          <Label>Table Title</Label>
          <Input
            value={section.title || ""}
            onChange={(e) => onUpdate(section.id, { title: e.target.value })}
            placeholder="Enter table title..."
          />
        </div>

        {/* Add Column Button */}
        {section.columns.length < 4 && (
          <Button type="button" variant="outline" size="sm" onClick={addColumn}>
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        )}

        {/* Columns Layout */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {section.columns.map((column, columnIndex) => (
            <div key={column.key} className="space-y-4">
              {/* Column Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">
                    Column {columnIndex + 1}
                  </Label>
                  {section.columns.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeColumn(columnIndex)}
                      className="h-6 px-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Input
                  value={column.header}
                  onChange={(e) => updateHeader(columnIndex, e.target.value)}
                  placeholder="Enter column header..."
                />
              </div>

              {/* Column Content */}
              <div className="bg-muted/40 rounded-md p-3">
                <TableCellEditor
                  content={section.rows[0][column.key]}
                  onChange={(value) => updateCell(column.key, value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseSection>
  );
}
