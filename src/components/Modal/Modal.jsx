// src/components/Modal/Modal.jsx
// Reusable glassmorphic modal — controlled via isOpen / onClose props
import styles from "./Modal.module.css";

function Modal({ isOpen, onClose, title, subtitle, points, tech }) {
    /**
     * When the backdrop (the outer .modal div) is clicked directly,
     * close the modal. Clicking inside the dialog won't trigger this
     * because the event target will be a child element.
     */
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className={`${styles.modal} ${isOpen ? styles.open : ""}`}
            onClick={handleBackdropClick}
        >
            <div className={styles.dialog}>
                <button className={styles.closeBtn} onClick={onClose}>
                    ×
                </button>
                <h2>{title}</h2>
                <p>{subtitle}</p>
                <ul>
                    {points.map((point, index) => (
                        <li key={index}>{point}</li>
                    ))}
                </ul>
                <p className={styles.meta}>Tech: {tech}</p>
            </div>
        </div>
    );
}

export default Modal;
