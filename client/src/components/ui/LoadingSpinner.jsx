import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className={styles.wrapper} role="status" aria-label={message}>
    <div className={styles.spinner} />
    {message && <p className={styles.message}>{message}</p>}
  </div>
);

export default LoadingSpinner;
