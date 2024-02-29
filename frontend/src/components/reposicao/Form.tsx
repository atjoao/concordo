import { formProps } from "@/lib/interfaces";
import styles from "./form.module.css";

import { RefObject, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Tdata = {
    message: string;
    status: string;
    error?: boolean;
};

const Form = ({ dialogSetState, dialogSetError, serverIp, status }: formProps) => {
    const router = useRouter();

    const searchParams = useSearchParams();

    const email = searchParams.get("email");
    const chave = searchParams.get("key");

    const [enviarForm, setEnviarForm] = useState<boolean>(false);

    const [data, setData] = useState<Tdata | null>(null);

    const REPPSW: RefObject<HTMLInputElement> | null = useRef(null);
    const PSW: RefObject<HTMLInputElement> | null = useRef(null);

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

        console.log(PSW?.current?.value === REPPSW?.current?.value);

        if (PSW?.current?.value !== REPPSW?.current?.value) {
            const data: Tdata = {
                message: "Palavras passe não iguais",
                status: "PASSWORD_NOT_EQUAL",
                error: true,
            };

            setData(data);
            setTimeout(() => {
                document.querySelector(".error")?.classList.add(styles.exit);
            }, 2000);

            setTimeout(() => {
                setData(null);
            }, 2500);
            return;
        }

        button.disabled = true;
        setEnviarForm(true);

        //@ts-ignore
        const formData = new FormData(e.target);

        if (!formData.get("password")) {
            dialogSetError("Não foi detectado certos elementos na pagina");
            dialogSetState(true);
            return;
        }

        if (!enviarForm) {
            // fazer coisa com o axios...
            const run = async () => {
                const data = {
                    newPassword: formData.get("password"),
                };
                fetch(
                    serverIp +
                        "/auth/reposicaoSenha?" +
                        new URLSearchParams({
                            key: String(chave),
                            email: String(email),
                        }),
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                        method: "POST",
                        body: JSON.stringify(data),
                    }
                )
                    .then(async (resp) => {
                        const data = await resp.json();

                        switch (data.status) {
                            case "MISSING_PARAMS":
                            case "INVALID_EMAIL":
                            case "NOT_FOUND":
                            case "PASSWORD_LENGTH":
                            case "MISSING_NEW_PASSWORD":
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
                            case "CHANGED_PASSWORD":
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
                            router.push("/auth/login");
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
                <h1>Repor palavra-passe</h1>
                <p style={{ marginTop: "10px" }}>Está a repor a palavra-passe para a conta: {email}</p>
                {status && status.account_verification === "true" ? (
                    <>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.inputs}>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Nova palavra-passe"
                                    required
                                    ref={PSW}
                                />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Repita nova palavra-passe"
                                    required
                                    ref={REPPSW}
                                />
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
