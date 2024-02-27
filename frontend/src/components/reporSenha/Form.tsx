import { formProps } from "@/lib/interfaces";
import styles from "./form.module.css";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Tdata = {
    message: string;
    status: string;
    error?: boolean;
};

const Form = ({ dialogSetState, dialogSetError, serverIp }: formProps) => {
    const searchParams = useSearchParams();

    const email = searchParams.get("email");

    const router = useRouter();
    const [enviarForm, setEnviarForm] = useState<boolean>(false);
    const [data, setData] = useState<Tdata | null>(null);

    const [status, setStatus] = useState<any>(null);

    // nota eu posso passar isto melhor
    // eu poderia passar a info a partir do layout.tsx
    // assim obeteria apenas uma vez ...
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

    useEffect(() => {
        if (status && status.account_verification == "false") {
            setTimeout(() => {
                router.push("/");
                return;
            }, 3000);
        }
    }, [status]);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        e.stopPropagation();
        // stupid ways to fix stuff
        //@ts-ignore
        const button = e.target.querySelector("button") || null;

        if (!button) {
            dialogSetError("Não foi detectado certos elementos na pagina");
            dialogSetState(true);
            return;
        }

        button.disabled = true;
        setEnviarForm(true);

        //@ts-ignore
        const formData = new FormData(e.target);

        if (!formData.get("email")) {
            dialogSetError("Não foi detectado certos elementos na pagina");
            dialogSetState(true);
            return;
        }

        if (!enviarForm) {
            // fazer coisa com o axios...
            const run = async () => {
                const data = {
                    email: formData.get("email"),
                };
                fetch(serverIp + "/auth/reporSenha", {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                    body: JSON.stringify(data),
                })
                    .then(async (resp) => {
                        const data = await resp.json();

                        switch (data.status) {
                            case "MISSING_PARAMS":
                            case "INVALID_EMAIL":
                            case "DUPLICATE_REQUEST":
                            case "INVALID_ACCOUNT":
                            case "SERVER_ERROR": {
                                setEnviarForm(false);
                                button.disabled = false;
                                setData({ ...data, error: true });

                                setTimeout(() => {
                                    document.querySelector(".error")?.classList.add(styles.exit);
                                }, 2000);

                                setTimeout(() => {
                                    setData(null);
                                }, 2500);
                                return;
                            }
                            case "PASSWORD_RESET_SENT":
                                return data;
                            default:
                                console.log("UNHANDLED PLZ CHECK THIS");
                                break;
                        }
                    })
                    .then(async (response) => {
                        if (response == undefined) return 0;
                        button.disabled = false;
                        setEnviarForm(false);
                        setData(response);

                        setTimeout(() => {
                            document.querySelector(".sucesso")?.classList.add(styles.exit);
                        }, 2000);

                        setTimeout(() => {
                            setData(null);
                        }, 2500);

                        return;
                    })
                    .catch((err) => {
                        console.log(err);
                        if (err) {
                            dialogSetError("Não consigo obter resposta do servidor");
                            dialogSetState(true);
                            return;
                        }
                    });
            };

            run();
        }
    }

    /* function onMouseHoverEvent() {
        setMouseHover(true);
    }

    function onMouseLeaveEvent() {
        setMouseHover(false);
    } */

    return (
        <div className={styles.container}>
            <div>
                {data?.error && (
                    <div className={"error " + styles.error}>
                        <p>{data?.message}</p>
                    </div>
                )}
                {data && !data?.error && (
                    <div className={"sucesso " + styles.correct}>
                        <p>{data?.message}</p>
                    </div>
                )}
            </div>
            <div className={styles.formElement}>
                <h1>Recuperar conta</h1>
                {status && status.account_verification === "true" ? (
                    <>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.inputs}>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="E-mail"
                                    required
                                    defaultValue={String(email)}
                                />
                            </div>
                            <div className={styles.links}>
                                <Link href="/auth/login">Entrar na conta?</Link>
                                <Link href="/auth/registro">Criar conta?</Link>
                            </div>

                            <button type="submit">Proceder</button>
                        </form>
                        {/* <div
                            className={styles.status}
                            onMouseEnter={onMouseHoverEvent}
                            onMouseLeave={onMouseLeaveEvent}
                        >
                            {!mouseHover ? (
                                status == null ? (
                                    <p>A obeter dados...</p>
                                ) : (
                                    <p>
                                        Servidor:
                                        {status ? (
                                            <span style={greenColor}> Online</span>
                                        ) : (
                                            <span style={redColor}> Offline</span>
                                        )}
                                    </p>
                                )
                            ) : (
                                <p className={styles.hoveredText} onClick={changeServerDialog}>
                                    Trocar de servidor?
                                </p>
                            )}
                        </div> */}
                    </>
                ) : (
                    <>{status && <p>O servidor não suporta esta função</p>}</>
                )}
            </div>
        </div>
    );
};

export default Form;
