"use client";

import { useRouter } from "next/navigation";
import React, { CSSProperties, createContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { layout, IChat } from "@/lib/interfaces";

import Loading from "../../assets/images/loading/loading.gif";
import styles from "./layout.module.css";
import { client, socket, destroyEverything } from "@/lib/socket/client";

import _userInfoDb, { User } from "@/lib/database/dbuserInfo";
import { openDatabases, deleteAllData } from "@/lib/database/dbManaging";
import Sidebar from "@/components/app/Sidebar";
import { checkDb_user } from "@/lib/fetching/getChatName";

import EventSetup from "./eventSetup";

import Settings from "./settings/Settings";
import { useTheme } from "./ThemeProvider";
import { themes } from "./Themes.styles";
import Preload from "@/components/preloader/preload";
import ChatsIndex from "@/components/app/ChatsIndex";
import ConcordoLoading from "@/components/icons/concordoLoading/concordoLoading";

export type serverInfo = {
    connected: boolean;
    address: string;
    users: number;
    account_verification: boolean;
};

interface constantsType {
    profile: any;
    setProfile: React.Dispatch<React.SetStateAction<any>>;
    f_requests: any;
    set_f_requests: React.Dispatch<React.SetStateAction<any>>;
    sent_requests: any;
    set_sent_requests: React.Dispatch<React.SetStateAction<any>>;
    blocked: any;
    set_blocked: React.Dispatch<React.SetStateAction<any>>;
    serverIp: any;
    //setServerIp: React.Dispatch<React.SetStateAction<any>>;
    userChats: any;
    setUserChats: React.Dispatch<React.SetStateAction<any>>;
    chatInfos: any;
    setChatInfos: React.Dispatch<React.SetStateAction<any>>;
    //cacheChatInfo: any;
    showSettings: any;
    photo: Blob | undefined;
    setPhoto: React.Dispatch<React.SetStateAction<Blob | undefined>>;
    serverInfo: Array<serverInfo> | null;
}

export const LayoutCached = createContext<constantsType | undefined>(undefined);

const Layout = ({ children }: layout) => {
    const router = useRouter();

    //config  stufg
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [loadingMsg, setLoadingMsg] = useState<string>("A carregar concordo");
    const [loading, setLoading] = useState<Boolean>(true);

    const [serverInfo, setServerInfo] = useState<Array<serverInfo> | null>(null);

    const { theme, setTheme } = useTheme();

    const customTheme: CSSProperties | any = {
        "--textColor": theme?.textColor,
        "--textColor2": theme?.textColor2,
        "--textBgColor": theme?.textBgColor,
        "--homeIcon": theme?.homeIcon,
        "--bg1": theme?.bg1,
        "--bg2": theme?.bg2,
        "--bg3": theme?.bg3,
        "--bg4": theme?.bg4,
        "--bg5": theme?.bg5,
        "--bg6": theme?.bg6,
        "--promptAlt": theme?.promptAlt,
        "--bgActive": theme?.bgActive,
        "--bgHover": theme?.bgHover,
        "--bgHover2": theme?.bgHover2,
        "--green": theme?.green,
        "--greenLight": theme?.greenLight,
        "--greenDark": theme?.greenDark,
        "--red": theme?.red,
        "--red2": theme?.red2,

        "--redDark": theme?.redDark,
        "--redHover": theme?.redHover,
        "--blue": theme?.blue,
        "--blueText": theme?.blueText,
        "--selectBoxColor": theme?.selectBoxColor,
    };

    const toggleSettings = () => {
        setShowSettings(!showSettings);
    };

    const serverIp = process.env.serverIp;

    // profile stuff
    const [profile, setProfile] = useState<any>(null);
    const [photo, setPhoto] = useState<Blob | undefined>(undefined);

    const [f_requests, set_f_requests] = useState<any>([]);
    const [sent_requests, set_sent_requests] = useState<any>([]);
    const [blocked, set_blocked] = useState<any>([]);

    const [userChats, setUserChats] = useState<any>([]);

    //const cacheChatInfo = cache.ChatInfos;
    const [chatInfos, setChatInfos] = useState<IChat[]>([]);

    // stupid hack

    let _run = false;

    useEffect(() => {
        if (_run) return;

        if (!socket?.connected) {
            console.log("nao tenho socket");
        } else {
            destroyEverything();
            router.push("/auth/login");
            return;
        }

        if (typeof window !== "undefined" && window.localStorage) {
            _run = true;

            if (!localStorage.getItem("token")) {
                router.push("/auth/login");
                return;
            }

            const run = async () => {
                setLoadingMsg("A iniciar sessão");

                await deleteAllData();
                await openDatabases();

                console.log("A verificar se token é valida");

                try {
                    const response = await fetch(serverIp + "/user/userinfo", {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    });

                    if (!response.ok) {
                        localStorage.removeItem("serverIp");
                        localStorage.removeItem("token");
                        if (socket) socket.close();
                        router.push("/auth/login");
                        return;
                    }

                    console.log("A obter dados de utilizador");
                    setLoadingMsg("A obter dados...");

                    const responseData = await response.json();

                    const userFriends = responseData.info.friends?.user;
                    const fRequests = responseData.info.friends?.requests;
                    const fsentRequests = responseData.info.friends?.sent_requests;
                    const blockList = responseData.info.block_list;

                    const ThemeId = localStorage.getItem("theme");

                    if (ThemeId && themes[ThemeId]) {
                        setTheme(themes[ThemeId]);
                    } else {
                        setTheme(themes.default);
                    }

                    setProfile(responseData);
                    set_f_requests(fRequests);
                    set_sent_requests(fsentRequests);
                    set_blocked(blockList);
                    setUserChats(Array.from(new Set(responseData.info.chats)));

                    console.log("A carregar chats");
                    //writeChatsToDb(responseData.info.chats);

                    const infoResponse = await fetch(serverIp + "/info");
                    const data = await infoResponse.json();
                    setServerInfo(data);

                    await client(String(localStorage.getItem("token")), String(data.address)).then((client) => {
                        setLoadingMsg("A conectar ao servidor...");

                        client.once("onlineFriends", async (data: any) => {
                            setLoadingMsg("Conectado!");

                            if (userFriends.length == 0) {
                                setTimeout(() => {
                                    setLoading(false);
                                }, 500);
                            }

                            if (Array.isArray(userFriends)) {
                                for (const friend of userFriends) {
                                    checkDb_user(friend, String(serverIp), true);
                                }
                                setTimeout(() => {
                                    setLoading(false);
                                }, 500);
                            }
                        });

                        client.on("connect_error", (reason) => {
                            if (reason.message === "INVALID_TOKEN") {
                                localStorage.removeItem("token");
                                if (socket) {
                                    socket.close();
                                }
                                router.push("/auth/login", undefined);
                                return;
                            }
                        });
                    });
                } catch (err) {
                    console.log(err);
                    localStorage.removeItem("token");
                    if (socket) {
                        socket.close();
                    }
                    router.push("/auth/login");
                }
            };

            run();
        }
    }, []);

    return (
        <LayoutCached.Provider
            value={{
                profile,
                setProfile,
                f_requests,
                set_f_requests,
                sent_requests,
                set_sent_requests,
                blocked,
                set_blocked,
                serverIp,
                userChats,
                setUserChats,
                chatInfos,
                setChatInfos,
                //cacheChatInfo,
                showSettings,
                photo,
                setPhoto,
                serverInfo,
            }}
        >
            <p style={{ position: "absolute" }}>Dev branch do concordo</p>
            {loading ? (
                <main className={styles.loadingScreen}>
                    <ConcordoLoading />
                    <p className={"loading"}>{loadingMsg}</p>
                    <Preload>
                        <ChatsIndex profile={profile} preload={true} />
                    </Preload>
                </main>
            ) : (
                <div id="appMount" style={customTheme}>
                    <EventSetup />
                    {showSettings &&
                        createPortal(
                            <Settings toggleSettings={toggleSettings} />,
                            // @ts-ignore
                            document.getElementById("appMount")
                        )}
                    <main className={styles.layout}>
                        <div className={styles.appSidebar}>
                            <Sidebar router={router} toggleSettings={toggleSettings} />
                        </div>
                        <div className={styles.appContainer}>{children}</div>
                    </main>
                </div>
            )}
        </LayoutCached.Provider>
    );
};

export default Layout;
