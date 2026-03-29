import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { X, Pencil, Save, Trash2 } from "lucide-react";
import { updateTask, deleteTask } from "../api/tasks";
import { Task } from "../types";
import styles from "./TaskDetailModal.module.css";

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

const TaskDetailModal = ({ task, onClose }: TaskDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [dueDate, setDueDate] = useState(task.due_date ?? "");
  const [status, setStatus] = useState(task.status);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: () => updateTask(task.id, { title, description, due_date: dueDate, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", task.list_id] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", task.list_id] });
      onClose();
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="task-detail-title">
      <div className={styles.modalBorder}>
        <div className={styles.modal}>

          <div className={styles.header}>
            {isEditing ? (
              <input
                id="task-detail-title"
                className={styles.titleInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Task title"
              />
            ) : (
              <h2 id="task-detail-title" className={styles.title}>{title}</h2>
            )}
            <button onClick={onClose} className={styles.closeButton} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>

          <div className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor="task-status">Status</label>
              {isEditing ? (
                <select
                  id="task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={styles.select}
                >
                  <option value="todo">To-Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              ) : (
                <span className={styles.fieldValue}>{status}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="task-due-date">Due Date</label>
              {isEditing ? (
                <input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={styles.input}
                />
              ) : (
                <span className={styles.fieldValue}>{dueDate || "No due date"}</span>
              )}
            </div>

            {task.labels.length > 0 && (
              <div className={styles.field}>
                <label>Labels</label>
                <div className={styles.labels}>
                  {task.labels.map(label => (
                    <span
                      key={label.id}
                      className={styles.labelBadge}
                      style={{ backgroundColor: label.color ?? "#9CA3AF" }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.descriptionSection}>
            <label htmlFor="task-description">Description</label>
            {isEditing ? (
              <textarea
                id="task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.textarea}
                rows={5}
              />
            ) : (
              <p className={styles.descriptionText}>{description || "No description."}</p>
            )}
          </div>

          {updateMutation.isError && (
            <p role="alert" className={styles.error}>Failed to update task.</p>
          )}
          {deleteMutation.isError && (
            <p role="alert" className={styles.error}>Failed to delete task.</p>
          )}

          <div className={styles.footer}>
            {isEditing ? (
              <button
                className={styles.saveButton}
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                aria-label="Save task"
              >
                <Save size={18} />
                {updateMutation.isPending ? "Saving..." : "Save"}
              </button>
            ) : (
              <button
                className={styles.editButton}
                onClick={() => setIsEditing(true)}
                aria-label="Edit task"
              >
                <Pencil size={18} />
                Edit
              </button>
            )}
            <button
              className={styles.deleteButton}
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              aria-label="Delete task"
            >
              <Trash2 size={18} />
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;