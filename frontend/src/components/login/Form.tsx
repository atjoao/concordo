"use client";

import { formProps } from "@/lib/interfaces";
import styles from "./form.module.css";
import { RefObject, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

const Form = ({ dialogSetState, dialogSetError, serverIp, changeServerDialog, setRedirectingState }: formProps) => {
    const router = useRouter();

    const redColor = {
        color: "red",
    };

    const greenColor = {
        color: "green",
    };

    const emailInput: RefObject<HTMLInputElement> | null = useRef(null);

    const [enviarForm, setEnviarForm] = useState<boolean>(false);
    const [status, setStatus] = useState<any>(null);
    const [mouseHover, setMouseHover] = useState<boolean>(false);
    const [loginError, setLoginError] = useState<boolean>(false);

    useEffect(() => {
        const verificarOnline = async () => {
            await fetch(serverIp + "/info")
                .then((resp) => resp.json())
                .then((response) => {
                    setStatus(response);
                })
                .catch(() => {
                    setStatus(false);
                });
        };

        verificarOnline();

        const interval = setInterval(() => {
            verificarOnline();
        }, 60000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        e.stopPropagation();

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

        if (!formData.get("email") || !formData.get("password")) {
            dialogSetError("Não foi detectado certos elementos na pagina");
            dialogSetState(true);
            return;
        }

        if (!enviarForm) {
            const run = async () => {
                const data = {
                    email: formData.get("email"),
                    password: formData.get("password"),
                };
                fetch(serverIp + "/auth/login", {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                    body: JSON.stringify(data),
                })
                    .then((resp) => {
                        if (resp.status !== 200 && resp.status !== 400 && resp.status !== 404) throw new Error("Erro");

                        if (resp.status === 404 || resp.status === 400) {
                            setLoginError(true);

                            button.disabled = false;
                            setEnviarForm(false);

                            setTimeout(() => {
                                document.querySelector(".error")?.classList.add(styles.exit);
                            }, 5000);

                            setTimeout(() => {
                                setLoginError(false);
                            }, 6000);

                            return;
                        }
                        return resp.json();
                    })
                    .then(async (response) => {
                        if (response == undefined) return 0;
                        button.disabled = false;
                        setEnviarForm(false);

                        localStorage.setItem("token", response.token);

                        if (!status) {
                            await fetch(serverIp + "/info").then(async (response) => {
                                const data = await response.json();
                                setStatus(data);
                            });
                        }

                        if (setRedirectingState) setRedirectingState(true);
                        router.push("/app");

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

    return (
        <>
            <div className={styles.container}>
                <div>
                    {loginError && (
                        <div className={"error " + styles.error}>
                            <p>E-mail ou password inválidos</p>
                        </div>
                    )}
                </div>
                <div className={styles.formElement}>
                    <h1>Entrar</h1>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.inputs}>
                            <input type="email" name="email" placeholder="E-mail" ref={emailInput} required />
                            <input type="password" name="password" placeholder="Password" required />
                        </div>
                        <div className={styles.links}>
                            <Link href="/auth/registro">Sem conta? Crie uma</Link>
                            {status && status.account_verification === "true" && (
                                <Link href="/auth/reporSenha">Recuperar Senha</Link>
                            )}
                        </div>

                        <button type="submit">Proceder</button>
                    </form>

                    {/* <div className={styles.status} onMouseEnter={onMouseHoverEvent} onMouseLeave={onMouseLeaveEvent}>
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
                </div>
            </div>
        </>
    );
};

export default Form;
