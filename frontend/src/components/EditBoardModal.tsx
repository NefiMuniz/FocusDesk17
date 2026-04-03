import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { updateBoard } from "../api/boards";
import { Board } from "../types";
import styles from "./EditBoardModal.module.css";

interface EditBoardModalProps {
  board: Board;
  onClose: () => void;
}

const EditBoardModal = ({ board, onClose }: EditBoardModalProps) => {
  const [name, setName] = useState(board.name);
  const [description, setDescription] = useState(board.description ?? "");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; description?: string }>({});

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => updateBoard(board.id, { name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", board.id] });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      onClose();
    },
  });

  const validate = (): boolean => {
    const errors: { name?: string; description?: string } = {};
    if (name.trim().length < 3) errors.name = "Board name must be at least 3 characters.";
    if (description.trim().length < 3) errors.description = "Description must be at least 3 characters.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate();
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="edit-board-title">
      <div className={styles.modalBorder}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <div>
              <h2 id="edit-board-title" className={styles.title}>Edit Board</h2>
              <p className={styles.subtitle}>Update your board details</p>
            </div>
            <button onClick={onClose} className={styles.closeButton} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <label htmlFor="board-name">Board Name *</label>
            <input
              id="board-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {fieldErrors.name && <p role="alert" className={styles.fieldError}>{fieldErrors.name}</p>}

            <label htmlFor="board-description">Description *</label>
            <textarea
              id="board-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            {fieldErrors.description && <p role="alert" className={styles.fieldError}>{fieldErrors.description}</p>}

            {mutation.isError && (
              <p role="alert" className={styles.error}>Failed to update board. Please try again.</p>
            )}

            <div className={styles.actions}>
              <button type="button" onClick={onClose} className={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" className={styles.submitButton} disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBoardModal;