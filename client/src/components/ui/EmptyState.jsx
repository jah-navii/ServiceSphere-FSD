import { Link } from 'react-router-dom';
import styles from './EmptyState.module.css';

const DefaultIcon = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
  </svg>
);

const EmptyState = ({ title = 'Nothing here yet', description, ctaLabel, ctaTo, onCtaClick, icon }) => (
  <div className={styles.wrapper}>
    {icon ?? <DefaultIcon />}
    <h3 className={styles.title}>{title}</h3>
    {description && <p className={styles.description}>{description}</p>}
    {ctaLabel && ctaTo    && <Link to={ctaTo} className={styles.cta}>{ctaLabel}</Link>}
    {ctaLabel && onCtaClick && <button onClick={onCtaClick} className={styles.cta}>{ctaLabel}</button>}
  </div>
);

export default EmptyState;
