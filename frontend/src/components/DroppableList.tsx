import { useDroppable } from "@dnd-kit/core";

interface Props {
  listId: string;
  children: React.ReactNode;
  className?: string;
}

const DroppableList = ({ listId, children, className }: Props) => {
  const { setNodeRef } = useDroppable({
    id: listId,
    data: { listId },
  });

  return (
    <div ref={setNodeRef} className={className} style={{ minHeight: "2rem" }}>
      {children}
    </div>
  );
};

export default DroppableList;