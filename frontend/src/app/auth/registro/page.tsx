"use client";

import Form from "@/components/registro/Form";
import styles from "./page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
    const [showDialog, setShowDiaglog] = useState<boolean>(false);
    const [dialogError, setDialogError] = useState<String | null>(null);

    //const [changeServerDialog, setChangeServerDialog] = useState<boolean>(false);

    const router = useRouter();
    const serverIp = process.env.serverIp;

    function handleReload() {
        if (typeof window !== "undefined" && window.localStorage) {
            window.location.reload();
        }
    }

    /* function closeDialog() {
        setDialogError(null);
        setShowDiaglog(false);

        setChangeServerDialog(false);
    }

    function handleServerChangeInput(event: any) {
        setServerIp(event.target.value);
    }

    function handleServerChange() {
        if (typeof window !== "undefined" && window.localStorage) {
            localStorage.setItem("serverIp", String(serverIp ? serverIp : process.env.serverIp));
            window.location.reload();
            return;
        }
    } */

    return (
        <>
            <div>
                {showDialog && (
                    <div className={styles.dialog}>
                        <div className={styles.dialogInside}>
                            <div className={styles.dialogTitle}>
                                <h1>Erro!</h1>
                            </div>
                            <div className={styles.dialogContent}>
                                <p>{dialogError}</p>
                            </div>
                            <div className={styles.left}>
                                <button onClick={handleReload}>Reiniciar pagina</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* {changeServerDialog && (
                    <div className={styles.dialog}>
                        <div className={styles.dialogInside}>
                            <div className={styles.dialogTitle}>
                                <h1>Trocar de servidor?</h1>
                            </div>
                            <div className={styles.dialogContent}>
                                <input
                                    type="text"
                                    name="serverIp"
                                    value={String(serverIp ? serverIp : process.env.serverIp)}
                                    onChange={handleServerChangeInput}
                                />
                            </div>
                            <div className={styles.left}>
                                <p onClick={closeDialog}>Cancelar</p>
                                <button onClick={handleServerChange}>Definir e reinciar</button>
                            </div>
                        </div>
                    </div>
                )} */}
            </div>

            <main className={styles.main}>
                <Form
                    dialogSetState={setShowDiaglog}
                    dialogSetError={setDialogError}
                    router={router}
                    serverIp={serverIp}
                />
            </main>
        </>
    );
}
