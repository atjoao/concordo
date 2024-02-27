// TODO
"use client";

import Form from "@/components/reposicao/Form";
import styles from "@/app/auth/registro/page.module.css";
import { Suspense, useEffect, useState } from "react";

export default function Page() {
    const [status, setStatus] = useState<any>(null);

    const [showDialog, setShowDiaglog] = useState<boolean>(false);
    const [dialogError, setDialogError] = useState<String | null>(null);

    //const [changeServerDialog, setChangeServerDialog] = useState<boolean>(false);
    const serverIp = process.env.serverIp;

    function handleReload() {
        if (typeof window !== "undefined" && window.localStorage) {
            window.location.reload();
        }
    }

    useEffect(() => {
        const verificarOnline = async () => {
            fetch(serverIp + "/info")
                .then((r) => r.json())
                .then((response) => {
                    setStatus(response);
                })
                .catch(() => {
                    setStatus(false);
                });
        };

        verificarOnline();
    }, []);

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

            {/**
             * nota react no momento em que um componente que pede por key
             * ele pensa que a key e para mencionar o componente
             * agora pq crls isso n da erro
             *
             * pq posso mencionar?
             * posso obeter a chave desse elemento?
             * pqp
             */}
            <main className={styles.main}>
                <Suspense>
                    <Form
                        dialogSetState={setShowDiaglog}
                        dialogSetError={setDialogError}
                        serverIp={serverIp}
                        status={status}
                    />
                </Suspense>
            </main>
        </>
    );
}
