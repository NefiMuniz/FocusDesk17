import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Grip } from "lucide-react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import styles from "./TaskCard.module.css";
import { getTasks, deleteTask } from "../api/tasks";
import { Task } from "../types";
import TaskDetailModal from "./TaskDetailModal";
import SortableTaskCard from "./SortableTaskCard";
import { isToday, isBefore, isAfter, addDays, startOfDay } from "date-fns";

interface TaskCardProps {
  listId: string;
  searchQuery: string;
  filterLabelId?: string;
  filterDueDate?: string;
}

const statusLabel: Record<string, string> = {
  todo: "To-Do",
  in_progress: "In Progress",
  done: "Done",
};

const TaskCard = ({ listId, searchQuery, filterLabelId, filterDueDate }: TaskCardProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks", listId],
    queryFn: () => getTasks(listId).then(res => res.data),
  });

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLabel = !filterLabelId || task.labels.some(l => l.id === filterLabelId);
    const matchesDueDate = (() => {
      if (!filterDueDate) return true;
      if (!task.due_date) return false;
    
      const dueDate = startOfDay(new Date(task.due_date));
      const now = startOfDay(new Date());
    
      if (filterDueDate === "today") {
        return isToday(dueDate);
      }
    
      if (filterDueDate === "overdue") {
        return isBefore(dueDate, now) && !isToday(dueDate);
      }
    
      if (filterDueDate === "week") {
        const in7Days = addDays(now, 7);
        return isAfter(dueDate, now) && isBefore(dueDate, in7Days);
      }
    
      if (filterDueDate === "next_week") {
        const in7Days = addDays(now, 7);
        const in14Days = addDays(now, 14);
        return isAfter(dueDate, in7Days) && isBefore(dueDate, in14Days);
      }
    
      return true;
    })();
    return matchesSearch && matchesLabel && matchesDueDate;
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", listId] });
    },
  });

  const handleDelete = (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteMutation.mutate(taskId);
    }
  };

  return (
    <>
      <SortableContext
        items={filteredTasks.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {filteredTasks.map(task => (
          <SortableTaskCard key={task.id} task={task} listId={listId}>
            <div
              className={styles.card}
              onClick={() => setSelectedTask(task)}
              role="button"
              tabIndex={0}
              aria-label={`Open task: ${task.title}`}
              onKeyDown={(e) => e.key === "Enter" && setSelectedTask(task)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <Grip size={14} />
                  <span className={styles.taskTitle}>{task.title}</span>
                </div>
                {task.labels.length > 0 && (
                  <span
                    className={styles.labelBadge}
                    style={{ backgroundColor: task.labels[0].color }}
                    aria-label={task.labels[0].name}
                  />
                )}
              </div>

              <div className={styles.statusRow}>
                <span className={styles.statusBadge}>{statusLabel[task.status] ?? task.status}</span>

                {task.due_date && (
                  <p className={styles.dueDate}>{task.due_date}</p>
                )}
              </div>

              {task.description && (
                <p className={styles.description}>{task.description}</p>
              )}

              <div className={styles.cardFooter}>
                <button
                  className={styles.iconButton}
                  aria-label="Edit task"
                  onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                >
                  <Pencil size={16} />
                </button>
                <button
                  className={styles.iconButtonDelete}
                  aria-label="Delete task"
                  onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </SortableTaskCard>
        ))}
      </SortableContext>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
};

export default TaskCard;