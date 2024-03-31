import AddFriendIcon from "@/components/icons/AddFriendIcon";
import styles from "./AddFriendTab.module.css";
import { SetStateAction, useContext, useEffect, useState } from "react";
import { LayoutCached } from "@/app/app/layout";
import { checkDb_user } from "@/lib/fetching/getChatName";
import ItemComponent from "./ItemComponent";
import { User } from "@/lib/database/dbuserInfo";
import StatusParser from "../StatusParser";

export default function AddFriendTab() {
    const { serverIp, sent_requests, set_sent_requests, set_f_requests, f_requests }: any = useContext(LayoutCached);

    const [loaded, setLoaded] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [friendInput, setFriendInput] = useState<string>("");

    const [status, setStatus] = useState<any>(null);

    useEffect(() => {
        if (sent_requests == null) {
            setLoading(false);
        }

        if (sent_requests != null) {
            const load_sent_requests = async () => {
                const loadedInfo = await Promise.all(
                    sent_requests.map(async (person: string) => {
                        const resp = await checkDb_user(person, String(serverIp), false);
                        return resp;
                    })
                );

                setLoaded(loadedInfo);
                setLoading(false);
            };

            load_sent_requests();
        }
    }, [sent_requests]);

    function inputCheck(e: any) {
        const input = e.target;

        if (e.key == "Backspace" || e.ctrlKey || e.altKey) {
            return;
        }

        if (input.value.length == 20) {
            e.preventDefault();
            e.stopPropagation();

            input.value += "#";
            return;
        }

        if (input.value.split("#")[1]?.length > 3) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (input.value.length > 20 || input.value.includes("#")) {
            if (!e.key.match(/[0-9]|Backspace|ArrowUp|ArrowDown|ArrowLeft|ArrowRight/)) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }

    function inputValueChange(e: any) {
        setFriendInput(e.target.value);
    }

    function sendRequest(e: any) {
        // @ts-ignore
        const inputElement = document.querySelector("input");
        // @ts-ignore
        inputElement.value = null;
        // @ts-ignore
        inputElement.disabled = true;
        e.target.disabled = true;

        const splitString = friendInput.split("#");
        if (splitString.length != 2) {
            setStatus({ status: "error", message: "Utilizador inválido" });
            // @ts-ignore
            inputElement.disabled = false;
            e.target.disabled = false;
            return;
        }

        const username = splitString[0].trim();
        if (username.length < 4 || username.length > 20) {
            setStatus({ status: "error", message: "Utilizador inválido" });
            // @ts-ignore
            inputElement.disabled = false;
            e.target.disabled = false;
            return;
        }

        const userTag = splitString[1].trim();
        if (userTag.length != 4) {
            setStatus({ status: "error", message: "Utilizador inválido" });
            // @ts-ignore
            inputElement.disabled = false;
            e.target.disabled = false;
            return;
        }

        const data = {
            username: username,
            descrim: userTag,
        };
        fetch(serverIp + "/user/sendRequest", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            method: "POST",
            redirect: "manual",
        })
            .then((response) => response.json())
            .then((resp) => {
                setStatus(resp);
                const inputElement = document.querySelector("input");
                //@ts-ignore
                inputElement.disabled = false;
                e.target.disabled = false;
                if (resp.status == "sent") {
                    set_sent_requests((sent_requests: any[]) => {
                        if (!sent_requests.includes(resp.sentTo)) {
                            return [...sent_requests, resp.sentTo];
                        }
                        return sent_requests;
                    });
                }
                if (resp.status == "accepted") {
                    checkDb_user(resp.sentTo, String(serverIp), true);

                    set_f_requests((f_requests: any[]) => {
                        return f_requests.filter((requestId) => requestId !== resp.sentTo);
                    });
                }
            })
            .catch((err) => {
                setStatus(err);
                const inputElement = document.querySelector("input");
                //@ts-ignore
                inputElement.disabled = false;
                e.target.disabled = false;
            });
    }

    return (
        <div className={styles.gap}>
            <section className={styles.addFriendPart}>
                <h1>
                    <AddFriendIcon />
                    Adicionar amigo
                </h1>
                {status && <StatusParser setStatus={setStatus} status={status.status} message={status.message} />}
                <div className={styles.inputClass}>
                    <input
                        type="text"
                        maxLength={35}
                        placeholder="Introduza o username#tag"
                        onKeyDown={inputCheck}
                        onChange={inputValueChange}
                    />
                    <button onClick={sendRequest} disabled={friendInput.length > 0 ? false : true}>
                        Enviar pedido de amizade
                    </button>
                </div>
            </section>
            <section className={styles.sentRequestsPart}>
                <h1>Pedidos pendentes</h1>

                {loading ? (
                    <p>A carregar</p>
                ) : loaded && loaded.length > 0 ? (
                    loaded.map((user: User) => (
                        <ItemComponent
                            key={user.id}
                            nome={user.username}
                            descrim={user.descrim}
                            id={user.id}
                            online={0}
                            avatar={user.avatar}
                            itemType="request_sent"
                            set_sent_requests={set_sent_requests}
                            sent_requests={sent_requests}
                        />
                    ))
                ) : (
                    <p>Não enviaste nenhum pedido</p>
                )}
            </section>
        </div>
    );
}
