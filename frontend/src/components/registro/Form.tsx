"use client";

import { formProps } from "@/lib/interfaces";
import styles from "./form.module.css";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import LoadingIcon from "../icons/loading/LoadingIcon";

const Form = ({ dialogSetState, dialogSetError, serverIp, router }: formProps) => {
    /* const redColor = {
        color: "red",
    };

    const greenColor = {
        color: "green",
    }; */

    const RE_EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/;

    const [enviarForm, setEnviarForm] = useState<boolean>(false);
    const [status, setStatus] = useState<any>(null);
    //const [mouseHover, setMouseHover] = useState<boolean>(false);

    const [registerError, setRegisterError] = useState<boolean>(false);
    const [registerErrormsg, setRegisterErrormsg] = useState<String | null>(null);

    const [contaCriada, setContaCriada] = useState<any>({});

    useEffect(() => {
        fetch(serverIp + "/info")
            .then((r) => r.json())
            .then((response) => {
                setStatus(response);
            })
            .catch(() => {
                setStatus(false);
            });
    }, []);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

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

        if (!formData.get("email") || !formData.get("password") || !formData.get("username")) {
            dialogSetError("Não foi detectado certos elementos na pagina");
            dialogSetState(true);
            return;
        }

        if (formData.get("username") || formData.get("password")) {
            const password = formData.get("password")?.toString();
            const username = formData.get("username")?.toString();
            const email = formData.get("email")?.toString();

            const formulario = document.querySelector(".f_formulario");

            if (
                (password && (password.trim().length < 8 || password.trim().length > 30)) ||
                (username && (username.trim().length < 4 || username.trim().length > 30)) ||
                (email && !email.match(RE_EMAIL))
            ) {
                formulario?.classList.add(styles.shake);

                button.disabled = false;
                setEnviarForm(false);

                setTimeout(() => {
                    formulario?.classList.remove(styles.shake);
                }, 2000);
            }
            
        }

        if (!enviarForm) {
            const run = async () => {
                const data = {
                    username: formData.get("username"),
                    email: formData.get("email"),
                    password: formData.get("password"),
                };

                fetch(serverIp + "/auth/register", {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                    body: JSON.stringify(data),
                    redirect: "manual",
                })
                    .then(async (resp) => {
                        const data = await resp.json();

                        switch (data.status) {
                            case "MISSING_PARAMS":
                            case "EMAIL_INVALID":
                            case "PASSWORD_LENGTH":
                            case "USERNAME_LENGTH":
                            case "ACCOUNT_EXISTS":
                            case "SERVER_ERROR":
                            case "CHECK_EMAIL":
                                setRegisterError(true);
                                button.disabled = false;
                                setEnviarForm(false);
                                setRegisterErrormsg(data.message);

                                if (data.status == "EMAIL_INVALID") {
                                    const email = formData.get("email")?.toString();
                                    const emailInput = document.querySelector(
                                        'input[name="email"]'
                                    ) as HTMLInputElement;
                                    if (email && !email.match(RE_EMAIL)) {
                                        if (emailInput) emailInput.style.border = "2px solid red";
                                    }
                                    setTimeout(() => {
                                        if (emailInput) emailInput.style.border = "0px solid";
                                    }, 2000);
                                }

                                if (data.status == "USERNAME_LENGTH") {
                                    const username = formData.get("username")?.toString();
                                    const usernameInput = document.querySelector(
                                        'input[name="username"]'
                                    ) as HTMLInputElement;

                                    if (username && (username.trim().length < 4 || username.trim().length > 30)) {
                                        if (usernameInput) usernameInput.style.border = "2px solid red";
                                    }

                                    setTimeout(() => {
                                        if (usernameInput) usernameInput.style.border = "0px solid";
                                    }, 2000);
                                }

                                if (data.status == "PASSWORD_LENGTH") {
                                    const password = formData.get("password")?.toString();
                                    const passwordInput = document.querySelector(
                                        'input[name="password"]'
                                    ) as HTMLInputElement;
                                    if (password && (password.trim().length < 8 || password.trim().length > 30)) {
                                        if (passwordInput) passwordInput.style.border = "2px solid red";
                                    }
                                    setTimeout(() => {
                                        if (passwordInput) passwordInput.style.border = "0px solid";
                                    }, 2000);
                                }

                                setTimeout(() => {
                                    document.querySelector(".error")?.classList.add(styles.exit);
                                }, 2000);

                                setTimeout(() => {
                                    setRegisterError(false);
                                    setRegisterErrormsg(null);
                                }, 2500);

                                return;

                            case "ACCOUNT_CREATED":
                                return data;

                            default:
                                throw new Error("Caso inexperado ocorreu");
                        }

                        //throw new Error("Erro");
                    })
                    .then((response) => {
                        if (response == undefined) return 0;
                        button.disabled = false;
                        setEnviarForm(false);

                        setContaCriada(response);

                        const form: any = e.target || null;
                        form?.reset();

                        setTimeout(() => {
                            document.querySelector(".sucesso")?.classList.add(styles.exit);
                        }, 2000);

                        setTimeout(() => {
                            setContaCriada(null);
                            router?.push("/auth/login");
                        }, 2500);

                        return;
                    })
                    .catch((err) => {
                        console.log(err);
                        if (err) {
                            dialogSetError("Este servidor não respondeu corretamente.");
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
        <>
            <div className={"f_formulario " + styles.container}>
                <div>
                    {registerError && (
                        <div className={"error " + styles.error}>
                            <p>{registerErrormsg}</p>
                        </div>
                    )}

                    {contaCriada?.accountCreated && (
                        <div className={"sucesso " + styles.correct}>
                            <p>{contaCriada.message}</p>
                        </div>
                    )}
                </div>
                <div className={styles.formElement}>
                    <h1>Criar conta</h1>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.inputs}>
                            <input type="username" name="username" placeholder="Username" required />
                            <input type="email" name="email" placeholder="E-mail" required />
                            <input type="password" name="password" placeholder="Password" required />
                        </div>
                        <div className={styles.links}>
                            <Link href="/auth/login">Já tem conta? Entre</Link>
                            {status && status.account_verification === "true" && (
                                <Link href="/auth/reporSenha">Recuperar Senha</Link>
                            )}
                        </div>  

                        {enviarForm ? (
                            <div style={
                                {
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: "100%",
                                    height: "10%"
                                }
                            }>
                                <LoadingIcon/>
                            </div>
                        ): (
                            <button type="submit">Proceder</button>
                        )} 
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
