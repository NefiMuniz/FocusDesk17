import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Trash2, Plus } from "lucide-react";
import styles from "./TaskCard.module.css";
import { getTasks } from "../api/tasks";
import { Task } from "../types";
import TaskDetailModal from "./TaskDetailModal";

interface TaskCardProps {
  listId: string;
  searchQuery: string;
}

const TaskCard = ({ listId, searchQuery }: TaskCardProps) => { 
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks", listId],
    queryFn: () => getTasks(listId).then(res => res.data),
  });

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {filteredTasks.map(task => (
        <div
          key={task.id}
          className={styles.card}
          onClick={() => setSelectedTask(task)}
          role="button"
          tabIndex={0}
          aria-label={`Open task: ${task.title}`}
          onKeyDown={(e) => e.key === "Enter" && setSelectedTask(task)}
        >
          <div className={styles.cardHeader}>
            <span className={styles.taskTitle}>{task.title}</span>
            {task.labels.length > 0 && (
              <span
                className={styles.label}
                style={{ backgroundColor: task.labels[0].color ?? "#9CA3AF" }}
                aria-label={task.labels[0].name}
              />
            )}
          </div>

          {task.labels.length > 0 && (
            <span className={styles.labelName}>{task.labels[0].name}</span>
          )}

          {task.due_date && (
            <p className={styles.dueDate}>Due date: {task.due_date}</p>
          )}

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
              className={styles.iconButton}
              aria-label="Delete task"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}

      <button className={styles.addTaskButton} aria-label="Add new task">
        <Plus size={18} />
        Add Task
      </button>

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