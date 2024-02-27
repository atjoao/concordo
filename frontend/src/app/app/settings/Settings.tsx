import { RefObject, useContext, useEffect, useRef, useState } from "react";
import styles from "./settings.module.css";
import DialogStyles from "@/components/dialogs/DialogStyles.module.css";

import { LayoutCached } from "../layout";
import EditIcon from "@/components/icons/EditIcon";
import ExitIcon from "@/components/icons/ExitIcon";
import PersonIcon from "@/components/icons/PersonIcon";

import { socket } from "@/lib/socket/client";
import { createPortal } from "react-dom";
import DialogBase from "@/components/dialogs/DialogBase";
import ErrorIcon from "@/components/icons/ErrorIcon";
import CheckmarkTickIcon from "@/components/icons/CheckmarkTickIcon";
import InfoIcon from "@/components/icons/InfoIcon";
import BrushIcon from "@/components/icons/BrushIcon";
import { useTheme } from "../ThemeProvider";
import { themes } from "../Themes.styles";

interface SettingsProps {
    toggleSettings: () => void;
}

function formatEmail(email: string) {
    const em = email.split("@");
    return "*".repeat(em[0].length) + "@" + em[1];
}

export default function Settings({ toggleSettings }: SettingsProps) {
    const { theme, setTheme } = useTheme();

    const [tab, setTab] = useState("main");
    const { serverIp, profile, setProfile, setPhoto, photo, serverInfo }: any = useContext(LayoutCached);

    const [username, setUsername] = useState<any>(profile.info.username);

    const [tempPhoto, setTempPhoto] = useState<Blob | undefined>(undefined);

    const [mostrarEmail, setMostrarEmail] = useState<boolean>(false);
    const [email, setEmail] = useState<string>(profile.info.email);
    const [promptAlteracoes, setPromptAlteracoes] = useState<boolean>(false);

    const [changeEmailError, setChangeEmailError] = useState<string | null>(null);
    const [changeEmailInfo, setChangeEmailInfo] = useState<string | null>(null);

    const [dialogEmail, setDialogEmail] = useState<boolean>(false);
    const emailInput: RefObject<HTMLInputElement> | null = useRef(null);
    const emailPswInput: RefObject<HTMLInputElement> | null = useRef(null);

    const [dialogPassword, setDialogPassword] = useState<boolean>(false);

    const [sucesso, setSucesso] = useState<boolean>(false);
    const [changePswError, setChangePswError] = useState<string | null>(null);
    const inputOldPswd: RefObject<HTMLInputElement> | null = useRef(null);
    const inputNewPswd: RefObject<HTMLInputElement> | null = useRef(null);

    function addFileClick(e: any) {
        let input: HTMLInputElement = document.createElement("input");

        input.type = "file";
        input.multiple = false;
        input.accept = "image/jpeg,image/png,image/webp";

        input.addEventListener("change", function () {
            if (input.files) {
                const file = input.files[0];
                const blob = new Blob([file], { type: file.type });

                setTempPhoto(blob);
            }
        });

        input.remove();
        input.click();
    }

    function handleUsernameChange(e: any) {
        if (e.target.value != "") setUsername(e.target.value);
    }

    function cancelarAlteracoes() {
        setTempPhoto(undefined);
        setUsername(profile.info.username);
        const element: any = document.getElementById("usernameInput");
        if (element) element.value = profile.info.username;
        setPromptAlteracoes(false);
    }

    function submeterAlteracoes() {
        const formData = new FormData();
        if (tempPhoto) {
            formData.append("avatar", tempPhoto, tempPhoto.name);
        }

        if (username != profile.info.username) {
            formData.append("username", String(username));
        }

        fetch(serverIp + "/user/updateProfile", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            method: "POST",
            body: formData,
        })
            .then((resp) => resp.json())
            .then((data) => {
                if (data.changed) {
                    fetch(serverIp + "/user/userinfo", {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                            "Content-Type": "application/json",
                        },
                    })
                        .then((resp) => resp.json())
                        .then((data: any) => {
                            setProfile(data);
                            setTempPhoto(undefined);
                            //console.log(data, profile.info.username);
                            setUsername(data.info.username);
                            fetch(serverIp + "/avatar/" + profile.info.id)
                                .then((data) => data.blob())
                                .then((data) => setPhoto(data));
                        });
                }
            });
    }

    useEffect(() => {
        function targetInput(e: KeyboardEvent) {
            if (dialogPassword || dialogEmail) return;

            if (e.key == "Escape") {
                toggleSettings();
                return;
            }
        }
        document.addEventListener("keydown", targetInput);

        return () => {
            document.removeEventListener("keydown", targetInput);
        };
    }, [dialogPassword, dialogEmail]);

    useEffect(() => {
        if (tempPhoto != undefined || username != profile.info.username) {
            return setPromptAlteracoes(true);
        }
        setPromptAlteracoes(false);
    }, [tempPhoto, username, profile]);

    return (
        <div
            className={styles.settings}
            onClick={(e) => {
                const element: any = e.target;
                if (element.className == styles.settings) {
                    toggleSettings();
                }
            }}
        >
            <div className={styles.container}>
                <div className={styles.closeButton} onClick={() => toggleSettings()}>
                    <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="20" fill="var(--textBgColor)" />
                        <path
                            d="M28.6531 11.9609C29.1828 11.3234 29.0984 10.3766 28.4609 9.84688C27.8234 9.31719 26.8766 9.40157 26.3469 10.0391L20 17.6563L13.6531 10.0391C13.1234 9.40157 12.1766 9.31719 11.5391 9.84688C10.9016 10.3766 10.8172 11.3234 11.3469 11.9609L18.0453 20L11.3469 28.0391C10.8172 28.6766 10.9016 29.6234 11.5391 30.1531C12.1766 30.6828 13.1234 30.5984 13.6531 29.9609L20 22.3438L26.3469 29.9609C26.8766 30.5984 27.8234 30.6828 28.4609 30.1531C29.0984 29.6234 29.1828 28.6766 28.6531 28.0391L21.9547 20L28.6531 11.9609Z"
                            fill="var(--textColor2)"
                        />
                    </svg>
                    <p>(Esc)</p>
                </div>
                <div className={styles.content}>
                    <div className={styles.tabSelector}>
                        <div style={{ display: "grid", gap: 10 }}>
                            <p onClick={() => setTab("main")} className={tab == "main" ? styles.active : undefined}>
                                A minha conta <PersonIcon />
                            </p>
                            <p onClick={() => setTab("temas")} className={tab == "temas" ? styles.active : undefined}>
                                Temas <BrushIcon />
                            </p>
                        </div>
                        <p
                            className={styles.red}
                            onClick={() => {
                                localStorage.removeItem("token");
                                if (socket) socket.close();
                                window.location.href = "/";
                            }}
                        >
                            Sair da conta <ExitIcon />
                        </p>
                    </div>

                    <main className={styles.tabContent}>
                        {tab === "main" && (
                            <>
                                <div className={styles.mainTabContent}>
                                    <div className={styles.mainTabPhoto}>
                                        <img
                                            src={
                                                tempPhoto
                                                    ? URL.createObjectURL(tempPhoto)
                                                    : photo
                                                    ? URL.createObjectURL(photo)
                                                    : serverIp + "/avatar/" + profile.info.id
                                            }
                                            style={{
                                                maxWidth: "128px",
                                                maxHeight: "128px",
                                                height: "128px",
                                                width: "128px",
                                                objectFit: "cover",
                                            }}
                                        />
                                        <button onClick={addFileClick}>Trocar foto</button>
                                    </div>

                                    <div className={styles.mainTabSContent}>
                                        <div>
                                            <p style={{ fontSize: "20px" }}>
                                                {username}#{profile.info.descrim}
                                            </p>
                                        </div>
                                        <div>
                                            <p>Nome de utilizador:</p>
                                            <input
                                                type="text"
                                                id="usernameInput"
                                                defaultValue={username}
                                                maxLength={20}
                                                onChange={handleUsernameChange}
                                            />
                                        </div>
                                        <div>
                                            <p>Email:</p>
                                            <div className={styles.inputContainer}>
                                                <input
                                                    id="email"
                                                    type="text"
                                                    value={mostrarEmail ? email : formatEmail(email)}
                                                    disabled
                                                />
                                                <button
                                                    onClick={() => {
                                                        setMostrarEmail(!mostrarEmail);
                                                    }}
                                                >
                                                    {mostrarEmail ? "Esconder" : "Mostrar"} email
                                                </button>
                                            </div>
                                        </div>
                                        <div className={styles.buttonsPanel}>
                                            <div>
                                                <p>Trocar palavra-passe:</p>
                                                <button
                                                    onClick={() => {
                                                        setDialogPassword(!dialogPassword);
                                                    }}
                                                >
                                                    <EditIcon /> Trocar palavra-passe
                                                </button>
                                            </div>
                                            {serverInfo.account_verification === "true" && (
                                                <div>
                                                    <p>Trocar Email</p>
                                                    <button
                                                        onClick={() => {
                                                            setDialogEmail(!dialogPassword);
                                                        }}
                                                    >
                                                        <EditIcon /> Trocar email
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {tab === "temas" && (
                            <>
                                <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
                                    <h1>Temas disponiveis</h1>
                                    <p>Tema selecionado: {theme?.name}</p>
                                    <hr />
                                </div>
                                <p style={{ padding: "10px 0px" }}>Escolhe um tema:</p>
                                <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
                                    {Object.keys(themes).map((tema) => {
                                        return (
                                            <div
                                                key={tema}
                                                onClick={() => {
                                                    setTheme(themes[tema]);
                                                    localStorage.setItem("theme", tema);
                                                }}
                                                style={{
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    maxWidth: "fit-content",
                                                    flexDirection: "column",
                                                    opacity: theme?.name == themes[tema].name ? 0.5 : 1,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 50,
                                                        height: 50,
                                                        backgroundColor: themes[tema].bg1,
                                                        outline: "1px solid var(--textColor)",
                                                        borderRadius: "50%",
                                                        gap: 5,
                                                    }}
                                                ></div>
                                                <p>{themes[tema].name}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {dialogPassword &&
                            createPortal(
                                <DialogBase
                                    title="Trocar Password?"
                                    description={
                                        "Ao trocar a palavra-passe vai automaticamente sair da sua conta e de outros dispostivos que tenham esta conta iniciada."
                                    }
                                    cancelAction={() => {
                                        if (sucesso) return 0;
                                        setDialogPassword(false);
                                        setSucesso(false);
                                        setChangePswError(null);
                                    }}
                                    submitActionName={"Trocar Palavra-Passe"}
                                    submitAction={() => {
                                        if (sucesso) return 0;

                                        if (!inputOldPswd.current || !inputNewPswd.current) {
                                            setDialogPassword(false);
                                            toggleSettings();
                                            return;
                                        }

                                        if (
                                            inputOldPswd.current.value.length < 8 ||
                                            inputOldPswd.current.value.length > 30
                                        ) {
                                            setChangePswError(
                                                `Palavra-passe antiga tem ${
                                                    inputOldPswd.current.value.length < 8
                                                        ? "menos de 8 caracters"
                                                        : inputOldPswd.current.value.length > 30
                                                        ? "mais de 30 caracters"
                                                        : "está vazia"
                                                }`
                                            );

                                            setTimeout(() => {
                                                setChangePswError(null);
                                            }, 5000);
                                            return;
                                        }

                                        if (
                                            inputNewPswd.current.value.length < 8 ||
                                            inputNewPswd.current.value.length > 30
                                        ) {
                                            setChangePswError(
                                                `Palavra-passe nova ${
                                                    inputOldPswd.current.value.length < 8
                                                        ? "tem menos de 8 caracters"
                                                        : inputOldPswd.current.value.length > 30
                                                        ? "tem mais de 30 caracters"
                                                        : "está vazia"
                                                } `
                                            );

                                            setTimeout(() => {
                                                setChangePswError(null);
                                            }, 5000);
                                            return;
                                        }

                                        const data = {
                                            newpassword: inputNewPswd.current.value,
                                            oldpassword: inputOldPswd.current.value,
                                        };

                                        fetch(serverIp + "/auth/trocarSenha", {
                                            headers: {
                                                "Content-Type": "application/json",
                                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                                            },
                                            body: JSON.stringify(data),
                                            method: "POST",
                                        })
                                            .then(async (resp) => {
                                                const data = await resp.json();
                                                if (resp.status === 200) {
                                                    return data;
                                                } else {
                                                    throw new Error(data.message);
                                                }
                                            })
                                            .then((data) => {
                                                setSucesso(true);

                                                setTimeout(() => {
                                                    localStorage.removeItem("token");
                                                    if (socket) socket.close();
                                                    window.location.href = "/";
                                                }, 1000);
                                            })
                                            .catch((error) => {
                                                setChangePswError(error.message);
                                                setTimeout(() => {
                                                    setChangePswError(null);
                                                }, 5000);
                                            });
                                    }}
                                >
                                    <div className={DialogStyles.dialogInputs}>
                                        {sucesso && (
                                            <div className={DialogStyles.dialogSucesso}>
                                                <CheckmarkTickIcon />
                                                <p>A palavra-passe foi trocada! a sair da conta...</p>
                                            </div>
                                        )}
                                        {changePswError && (
                                            <div className={DialogStyles.dialogError}>
                                                <ErrorIcon />
                                                <p>{changePswError}</p>
                                            </div>
                                        )}

                                        <p>Palavra-passe antiga</p>
                                        <input
                                            type="password"
                                            name="oldpassword"
                                            ref={inputOldPswd}
                                            required
                                            minLength={8}
                                            maxLength={30}
                                        />
                                        <p>Palavra-passe nova</p>
                                        <input
                                            type="password"
                                            name="novapassword"
                                            ref={inputNewPswd}
                                            required
                                            minLength={8}
                                            maxLength={30}
                                        />
                                    </div>
                                </DialogBase>,
                                //@ts-ignore
                                document.getElementById("appMount")
                            )}

                        {dialogEmail &&
                            createPortal(
                                <DialogBase
                                    title="Trocar Email?"
                                    description={
                                        "Vai-lhe ser enviado um email para continuar com o processo! Este processo termina a sua conta de todos os dispositivos que tenham esta conta iniciada"
                                    }
                                    cancelAction={() => {
                                        if (sucesso) return 0;
                                        setDialogEmail(false);
                                        setSucesso(false);
                                        setChangeEmailError(null);
                                    }}
                                    submitActionName={"Trocar de Email?"}
                                    submitAction={() => {
                                        if (sucesso) return 0;
                                        if (!emailInput.current || !emailPswInput.current) {
                                            setSucesso(false);
                                            setDialogEmail(false);
                                            toggleSettings();
                                            return;
                                        }

                                        const data = {
                                            newEmail: emailInput.current.value,
                                            password: emailPswInput.current.value,
                                        };

                                        fetch(serverIp + "/auth/pedirTrocaEmail", {
                                            headers: {
                                                "Content-Type": "application/json",
                                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                                            },
                                            body: JSON.stringify(data),
                                            method: "POST",
                                        })
                                            .then(async (resp) => {
                                                const data = await resp.json();
                                                if (resp.status == 200) {
                                                    return data;
                                                } else {
                                                    throw new Error(data.message);
                                                }
                                            })
                                            .then((data) => {
                                                switch (data.status) {
                                                    case "EMAIL_TOOK":
                                                        setChangeEmailInfo(data.message);
                                                        break;

                                                    case "ALTERADY_EXISTS_CHANGE":
                                                        setChangeEmailInfo(data.message);
                                                        break;

                                                    case "SENT_CHANGE_REQUEST":
                                                        setSucesso(true);
                                                        break;
                                                }

                                                setTimeout(() => {
                                                    setChangeEmailInfo(null);
                                                    setSucesso(false);
                                                }, 5000);
                                            })
                                            .catch((error) => {
                                                //console.log(error.message);
                                                setChangeEmailError(String(error.message));
                                                setTimeout(() => {
                                                    setChangeEmailError(null);
                                                }, 5000);
                                            });
                                    }}
                                >
                                    <div className={DialogStyles.dialogInputs}>
                                        {/** tem maneiras mlhrs de fazer isto but idc */}
                                        <p>Email atual: {email}</p>

                                        {sucesso && (
                                            <div className={DialogStyles.dialogSucesso}>
                                                <CheckmarkTickIcon />
                                                <p>Foi-lhe enviado um email para continuar com o processo...</p>
                                            </div>
                                        )}

                                        {changeEmailInfo && (
                                            <div className={DialogStyles.dialogInfo}>
                                                <InfoIcon />
                                                <p>{changeEmailInfo}</p>
                                            </div>
                                        )}

                                        {changeEmailError && (
                                            <div className={DialogStyles.dialogError}>
                                                <ErrorIcon /> <p>{changeEmailError}</p>
                                            </div>
                                        )}
                                        <p>Novo email</p>
                                        <input type="email" name="newEmail" ref={emailInput} required />
                                        <p>Palavra-passe atual</p>
                                        <input type="password" name="novapassword" ref={emailPswInput} required />
                                    </div>
                                </DialogBase>,
                                //@ts-ignore
                                document.getElementById("appMount")
                            )}

                        {promptAlteracoes && (
                            <div className={styles.promptAlteracoes}>
                                <p>Pretende avançar com as configurações?</p>
                                <div>
                                    <p onClick={cancelarAlteracoes}>Cancelar</p>
                                    <p className={styles.alterar} onClick={submeterAlteracoes}>
                                        Alterar
                                    </p>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
