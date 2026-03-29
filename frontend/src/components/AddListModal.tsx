import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { createList } from "../api/lists";
import styles from "./AddListModal.module.css";

interface AddListModalProps {
  boardId: string;
  onClose: () => void;
}

const AddListModal = ({ boardId, onClose }: AddListModalProps) => {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => createList(boardId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists", boardId] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("List name must be at least 2 characters.");
      return;
    }
    if (position.trim().length < 1) {
      setError("Please set a position");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="add-list-title">
      <div className={styles.modalBorder}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2 id="add-list-title" className={styles.title}>Add New List</h2>
            <button onClick={onClose} className={styles.closeButton} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <label htmlFor="list-name">List Name *</label>
            <input
              id="list-name"
              type="text"
              placeholder="e.g. To-Do"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label htmlFor="list-name">Position *</label>
            <input
              id="list-position"
              type="number"
              placeholder="e.g. 1"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
            {error && <p role="alert" className={styles.fieldError}>{error}</p>}
            {mutation.isError && (
              <p role="alert" className={styles.fieldError}>Failed to create list. Please try again.</p>
            )}

            <div className={styles.actions}>
              <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
              <button type="submit" className={styles.submitButton} disabled={mutation.isPending}>
                {mutation.isPending ? "Creating..." : "Add List"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddListModal;