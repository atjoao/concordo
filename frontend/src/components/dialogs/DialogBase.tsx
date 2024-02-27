import React, { MouseEventHandler, useEffect } from "react";
import styles from "./DialogBase.module.css";
type dialogType = {
    // content
    title: string;
    description?: string | null;
    children?: React.ReactNode | null;
    color?: string | null;
    //actions
    submitActionName: string;
    submitAction: MouseEventHandler<any>;
    cancelAction: MouseEventHandler<any>;
};

const DialogBase: React.FC<dialogType> = (dialog) => {
    useEffect(() => {
        const targetInput = (e: Event) => {
            e.stopImmediatePropagation();
        };
        document.addEventListener("keydown", targetInput, true);

        return () => {
            document.removeEventListener("keydown", targetInput, true);
        };
    }, []);

    return (
        <div
            className={styles.overlay}
            onClick={(e: any) => {
                e.stopPropagation();
            }}
        >
            <div className={styles.dialogBox}>
                <div className={styles.dialogTitle}>
                    <h1>{dialog.title}</h1>
                </div>

                {dialog.description && (
                    <div className={styles.dialogDesc}>
                        <p>{dialog.description}</p>
                    </div>
                )}

                {dialog.children && <div className={styles.dialogConteudo}>{dialog.children}</div>}

                <div className={styles.buttons}>
                    <p onClick={dialog.cancelAction}>Cancelar</p>
                    <button className={dialog.color ? styles.customColor : ""} onClick={dialog.submitAction}>
                        {dialog.submitActionName}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DialogBase;
