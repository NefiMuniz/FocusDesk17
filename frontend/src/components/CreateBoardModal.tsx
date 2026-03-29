import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { createBoard } from "../api/boards";
import styles from "./CreateBoardModal.module.css";

interface CreateBoardModalProps {
  onClose: () => void;
}

const CreateBoardModal = ({ onClose }: CreateBoardModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; description?: string }>({});

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => createBoard(name, description),
    onSuccess: () => {
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
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className={styles.modalBorder}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div>
                        <h2 id="modal-title" className={styles.title}>Create New Board</h2>
                        <p className={styles.subtitle}>Organize your tasks in a new board</p>
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
                            placeholder="e.g. My Project"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        {fieldErrors.name && <p role="alert" className={styles.fieldError}>{fieldErrors.name}</p>}

                        <label htmlFor="board-description">Description *</label>
                        <textarea
                            id="board-description"
                            placeholder="What is this board about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                        {fieldErrors.description && <p role="alert" className={styles.fieldError}>{fieldErrors.description}</p>}

                        {mutation.isError && (
                            <p role="alert" className={styles.error}>Failed to create board. Please try again.</p>
                        )}

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                        Cancel
                        </button>
                        <button type="submit" className={styles.submitButton} disabled={mutation.isPending}>
                        {mutation.isPending ? "Creating..." : "Create Board"}
                        </button>
                    </div>
                </form>
            </div>
        </div>      
    </div>
  );
};

export default CreateBoardModal;