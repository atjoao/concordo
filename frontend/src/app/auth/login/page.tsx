"use client";

import Form from "@/components/login/Form";
import styles from "./page.module.css";

import formStyle from "@/components/login/form.module.css";
import { useEffect, useState } from "react";
import LoadingIcon from "@/components/icons/loading/LoadingIcon";
import { useRouter } from "next/navigation";
import { destroyEverything, socket } from "@/lib/socket/client";

export default function Login() {
    const router = useRouter();
    const [showDialog, setShowDiaglog] = useState<boolean>(false);
    const [dialogError, setDialogError] = useState<String | null>(null);

    const [redirectingState, setRedirectingState] = useState<boolean>(false);

    const serverIp = process.env.serverIp;

    useEffect(() => {
        if (socket?.connected) destroyEverything();
    }, []);

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
