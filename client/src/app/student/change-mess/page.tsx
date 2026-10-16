import styles from "../student.module.css";

export default function ChangeMessPage() {
  return (
    <div className={styles.blankPageWrapper}>
      <div className={styles.blankHeader}>
        <h1 className={styles.pageTitle}>Change Mess</h1>
        <p className={styles.pageSubtitle}>Request monthly mess reallocation or alternate dining unit</p>
      </div>
      <div className={styles.blankCanvas} />
    </div>
  );
}
