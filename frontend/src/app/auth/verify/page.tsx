"use client";

import styles from "@/app/auth/verify/page.module.css";
import formstyle from "@/components/registro/form.module.css";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingIcon from "@/components/icons/loading/LoadingIcon";

type StatusType = { message: string; status: string };

type functionParams = {
    serverIp: string | undefined;
    sucesso: Boolean;
    erro: StatusType | null;

    setErro: React.Dispatch<React.SetStateAction<StatusType | null>>;
    setSucesso: React.Dispatch<React.SetStateAction<Boolean>>;
};

function WaitingForSearchParams({ serverIp, sucesso, erro, setErro, setSucesso }: functionParams) {
    const router = useRouter();

    const searchParams = useSearchParams();

    const email = searchParams.get("email");
    const key = searchParams.get("key");

    useEffect(() => {
        if (!email || !key) {
            return router.push("/");
        }
    }, []);

    function sendVer() {
        if (!email || !key) return;
        if (sucesso || erro) return;

        fetch(serverIp + "/auth/verify?" + new URLSearchParams({ key: key, email: email }))
            .then(async (resp) => {
                const data = await resp.json();

                switch (data.status) {
                    case "MISSING_PARAMS":
                    case "INVALID_EMAIL":
                    case "NOT_FOUND":
                        setErro(data);

                        setTimeout(() => {
                            router.push("/auth/login");
                        }, 2000);

                        return;

                    case "COMPLETED":
                        return data;

                    default:
                        break;
                }
            })
            .then((response) => {
                if (response == undefined) return 0;

                setSucesso(true);

                setTimeout(() => {
                    router.push("/auth/login");
                }, 2000);
            });
    }

    return (
        <>
            <div className={styles.separator}>
                <p>Está prestes a verificar a conta</p>
                <p>{email}</p>
            </div>
            <button onClick={sendVer}>Proceder</button>
        </>
    );
}

export default function Page() {
    const serverIp = process.env.serverIp;

    const [erro, setErro] = useState<StatusType | null>(null);
    const [sucesso, setSucesso] = useState<Boolean>(false);

    return (
        <>
            <main className={styles.main}>
                <div className={formstyle.container}>
                    <div>
                        {erro && (
                            <div className={"error " + formstyle.error}>
                                <p>{erro.message}</p>
                            </div>
                        )}

                        {sucesso && (
                            <div className={"sucesso " + formstyle.correct}>
                                <p>Verificação concluida!</p>
                            </div>
                        )}
                    </div>
                    <div className={formstyle.formElement}>
                        <h1>Verificar Conta</h1>
                        <Suspense>
                            <WaitingForSearchParams
                                serverIp={serverIp}
                                setErro={setErro}
                                setSucesso={setSucesso}
                                sucesso={sucesso}
                                erro={erro}
                            />
                        </Suspense>
                    </div>
                </div>
            </main>
        </>
    );
}
