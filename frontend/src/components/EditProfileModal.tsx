import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { updateMe } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import styles from "./EditProfileModal.module.css";
import useModalKeyboard from "../hooks/useModalKeyboard";
import useFocusTrap from "../hooks/useFocusTrap";

interface EditProfileModalProps {
  onClose: () => void;
}

const EditProfileModal = ({ onClose }: EditProfileModalProps) => {
  useModalKeyboard(onClose);
  const trapRef = useFocusTrap();
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string }>({});

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => updateMe({ name, email }),
    onSuccess: () => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["me"] });
      onClose();
    },
  });

  const validate = (): boolean => {
    const errors: { name?: string; email?: string } = {};
    if (name.trim().length < 3) errors.name = "Name must be at least 3 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Please enter a valid email.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate();
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="edit-profile-title">
      <div className={styles.modalBorder} ref={trapRef}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <div>
              <h2 id="edit-profile-title" className={styles.title}>Edit Profile</h2>
              <p className={styles.subtitle}>Update your account details</p>
            </div>
            <button onClick={onClose} className={styles.closeButton} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <label htmlFor="profile-name">Name</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {fieldErrors.name && <p role="alert" className={styles.fieldError}>{fieldErrors.name}</p>}

            <label htmlFor="profile-email">Email</label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {fieldErrors.email && <p role="alert" className={styles.fieldError}>{fieldErrors.email}</p>}

            {mutation.isError && (
              <p role="alert" className={styles.error}>Failed to update profile. Email may already be taken.</p>
            )}

            <div className={styles.actions}>
              <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
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

export default EditProfileModal;