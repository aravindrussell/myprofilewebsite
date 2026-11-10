import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, type ReactNode } from "react";

interface Props<T> {
  items: T[];
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  onReorder: (items: T[]) => void;
  onDelete?: (index: number) => void;
  /** Optional visibility toggle shown in the item header. */
  visible?: (item: T) => boolean;
  onToggleVisible?: (index: number) => void;
  renderItem?: (item: T, index: number) => ReactNode;
  /** Name used in labels, e.g. "experience". */
  noun: string;
}

/**
 * Reorderable list: drag the handle with a pointer, or focus it and use Space + arrow keys.
 * Up/down buttons give a second keyboard path. Items expand to show their editor.
 */
export function SortableList<T>(props: Props<T>) {
  const { items, getId, onReorder } = props;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => getId(i) === active.id);
    const to = items.findIndex((i) => getId(i) === over.id);
    onReorder(arrayMove(items, from, to));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map(getId)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2" data-testid={`list-${props.noun}`}>
          {items.map((item, index) => (
            <SortableItem key={getId(item)} {...props} item={item} index={index} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem<T>({
  item,
  index,
  items,
  getId,
  getLabel,
  onReorder,
  onDelete,
  visible,
  onToggleVisible,
  renderItem,
  noun,
}: Props<T> & { item: T; index: number }) {
  const id = getId(item);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } =
    useSortable({ id });
  const [open, setOpen] = useState(false);
  const label = getLabel(item) || `Untitled ${noun}`;
  const isVisible = visible?.(item) ?? true;
  const move = (to: number) => {
    onReorder(arrayMove(items, index, to));
  };
  const iconBtn =
    "inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg disabled:opacity-30";

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-lg border border-line bg-surface"
      data-testid="list-item"
    >
      <div className="flex items-center gap-1 px-2 py-1.5">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className={`${iconBtn} cursor-grab`}
          aria-label={`Reorder ${label}`}
        >
          ⠿
        </button>
        <button
          type="button"
          className="min-w-0 flex-1 truncate rounded px-2 py-1 text-left text-sm font-medium hover:bg-surface-2"
          aria-expanded={renderItem ? open : undefined}
          data-testid="item-label"
          onClick={() => {
            setOpen((o) => !o);
          }}
        >
          <span className={isVisible ? "" : "text-muted line-through"}>{label}</span>
        </button>
        <button
          type="button"
          className={iconBtn}
          disabled={index === 0}
          aria-label={`Move ${label} up`}
          onClick={() => {
            move(index - 1);
          }}
        >
          ↑
        </button>
        <button
          type="button"
          className={iconBtn}
          disabled={index === items.length - 1}
          aria-label={`Move ${label} down`}
          onClick={() => {
            move(index + 1);
          }}
        >
          ↓
        </button>
        {onToggleVisible && (
          <button
            type="button"
            className={`${iconBtn} w-auto px-2 font-mono text-xs`}
            aria-pressed={isVisible}
            aria-label={`${isVisible ? "Hide" : "Show"} ${label}`}
            onClick={() => {
              onToggleVisible(index);
            }}
          >
            {isVisible ? "shown" : "hidden"}
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className={`${iconBtn} hover:text-red-600`}
            aria-label={`Delete ${label}`}
            onClick={() => {
              if (window.confirm(`Delete "${label}"?`)) onDelete(index);
            }}
          >
            ✕
          </button>
        )}
      </div>
      {renderItem && open && (
        <div className="space-y-4 border-t border-line p-4">{renderItem(item, index)}</div>
      )}
    </li>
  );
}
