import ThreeDotsIcon from "@/components/icons/ThreeDotsIcon";
import styles from "./MessageToolbox.module.css";

export default function MessageToolbox({ currentToolbox, setCurrentToolbox, message }: any) {
    return (
        <>
            <div
                className={styles.options + " " + (currentToolbox === null ? "" : styles.toolBoxActive)}
                onClick={(e) => {
                    if (currentToolbox) return setCurrentToolbox(null);
                    setCurrentToolbox(message._id);
                    console.log(message._id, currentToolbox);
                }}
            >
                <div className={styles.toolBox}></div>
                <ThreeDotsIcon />
            </div>
        </>
    );
}
