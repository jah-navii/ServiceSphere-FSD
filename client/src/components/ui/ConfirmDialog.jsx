import styles from './ConfirmDialog.module.css';

const ConfirmDialog = ({ isOpen, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = true }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.dialog}>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={`${styles.confirmBtn} ${danger ? styles.danger : ''}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
