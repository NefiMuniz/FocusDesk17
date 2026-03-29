import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { createTask } from "../api/tasks";
import { getBoards } from "../api/boards";
import { getLists } from "../api/lists";
import { getLabels } from "../api/labels";
import { Board, TaskList, Label } from "../types";
import styles from "./CreateTaskModal.module.css";

interface CreateTaskModalProps {
  onClose: () => void;
  preselectedBoardId?: string;
}

const CreateTaskModal = ({ onClose, preselectedBoardId }: CreateTaskModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("todo");
  const [selectedBoardId, setSelectedBoardId] = useState(preselectedBoardId ?? "");
  const [selectedListId, setSelectedListId] = useState("");
  const [selectedLabelId, setSelectedLabelId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; list?: string }>({});

  const queryClient = useQueryClient();

  const { data: boards = [] } = useQuery<Board[]>({
    queryKey: ["boards"],
    queryFn: () => getBoards().then(res => res.data),
  });

  const { data: allLists = [] } = useQuery<TaskList[]>({
    queryKey: ["lists", "all"],
    queryFn: async () => {
      const results = await Promise.all(
        boards.map(board => getLists(board.id).then(res => res.data))
      );
      return results.flat();
    },
    enabled: boards.length > 0,
  });

  const boardsWithLists = boards.filter(board =>
    allLists.some(list => list.board_id === board.id)
  );

  const { data: lists = [] } = useQuery<TaskList[]>({
    queryKey: ["lists", selectedBoardId],
    queryFn: () => getLists(selectedBoardId).then(res => res.data),
    enabled: !!selectedBoardId,
  });

  const { data: labels = [] } = useQuery<Label[]>({
    queryKey: ["labels"],
    queryFn: () => getLabels().then(res => res.data),
  });

  const mutation = useMutation({
    mutationFn: () => createTask(selectedListId, {
      title,
      description: description || undefined,
      due_date: dueDate || undefined,
      status,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", selectedListId] });
      onClose();
    },
  });

  const validate = (): boolean => {
    const errors: { title?: string; list?: string } = {};
    if (title.trim().length < 1) errors.title = "Title is required.";
    if (title.trim().length > 200) errors.title = "Title must be under 200 characters.";
    if (!selectedListId) errors.list = "Please select a list.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate();
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="create-task-title">
      <div className={styles.modalBorder}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2 id="create-task-title" className={styles.title}>Add New Task</h2>
            <button onClick={onClose} className={styles.closeButton} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <label htmlFor="task-title">Title *</label>
            <input
              id="task-title"
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {fieldErrors.title && <p role="alert" className={styles.fieldError}>{fieldErrors.title}</p>}

            <label htmlFor="task-board">Board *</label>
            <select
              id="task-board"
              value={selectedBoardId}
              onChange={(e) => { setSelectedBoardId(e.target.value); setSelectedListId(""); }}
              disabled={!!preselectedBoardId}
              className={styles.select}
            >
              <option value="">Select a board</option>
              {(preselectedBoardId ? boards : boardsWithLists).map(board => (
                <option key={board.id} value={board.id}>{board.name}</option>
              ))}
            </select>

            <label htmlFor="task-list">List *</label>
            <select
              id="task-list"
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
              disabled={!selectedBoardId}
              className={styles.select}
            >
              <option value="">Select a list</option>
              {lists.map(list => (
                <option key={list.id} value={list.id}>{list.name}</option>
              ))}
            </select>
            {fieldErrors.list && <p role="alert" className={styles.fieldError}>{fieldErrors.list}</p>}

            <label htmlFor="task-label">Label</label>
            <select
              id="task-label"
              value={selectedLabelId}
              onChange={(e) => setSelectedLabelId(e.target.value)}
              className={styles.select}
            >
              <option value="">No label</option>
              {labels.map(label => (
                <option key={label.id} value={label.id}>{label.name}</option>
              ))}
            </select>

            <label htmlFor="task-status">Status</label>
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

            <label htmlFor="task-due-date">Due Date</label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              placeholder="Task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            {mutation.isError && (
              <p role="alert" className={styles.error}>Failed to create task. Please try again.</p>
            )}

            <div className={styles.actions}>
              <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
              <button type="submit" className={styles.submitButton} disabled={mutation.isPending}>
                {mutation.isPending ? "Creating..." : "Add Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;