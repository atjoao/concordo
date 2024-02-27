"use client";

import Form from "@/components/login/Form";
import styles from "./page.module.css";

import formStyle from "@/components/login/form.module.css";
import { useEffect, useState } from "react";
import LoadingIcon from "@/components/icons/loading/LoadingIcon";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();
    const [showDialog, setShowDiaglog] = useState<boolean>(false);
    const [dialogError, setDialogError] = useState<String | null>(null);

    const [redirectingState, setRedirectingState] = useState<boolean>(false);

    const serverIp = process.env.serverIp;

    useEffect(() => {
        if (typeof window !== "undefined" && window.localStorage) {
            if (localStorage.getItem("token")) {
                setRedirectingState(true);
                router.push("/app");
            }
        }
    }, []);

    function handleReload() {
        window.location.reload();
    }

    /* function closeDialog() {
        setDialogError(null);
        setShowDiaglog(false);

        setChangeServerDialog(false);
    }

    function handleServerChangeInput(event: any) {
        setServerIp(event.target.innerText);
    }

    function handleServerChange() {
        if (typeof window !== "undefined" && window.localStorage) {
            const serverInput: HTMLInputElement | null = document.querySelector("input[name='serverIp']");

            localStorage.setItem("serverIp", String(serverInput ? serverInput.value : process.env.serverIp));

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
                                <button onClick={handleReload}>Recarregar página</button>
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
                                    defaultValue={String(serverIp ? serverIp : process.env.serverIp)}
                                />
                            </div>
                            <div className={styles.left}>
                                <p onClick={closeDialog}>Cancelar</p>
                                <button onClick={handleServerChange}>Aplicar alterações</button>
                            </div>
                        </div>
                    </div>
                )} */}
            </div>

            <main className={styles.main}>
                {redirectingState ? (
                    <>
                        <div className={formStyle.formElement} style={{ alignItems: "center" }}>
                            <LoadingIcon />
                        </div>
                    </>
                ) : (
                    <>
                        <Form
                            dialogSetState={setShowDiaglog}
                            dialogSetError={setDialogError}
                            serverIp={serverIp}
                            setRedirectingState={setRedirectingState}
                        />
                    </>
                )}
            </main>
        </>
    );
}
