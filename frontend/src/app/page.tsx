"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/header";
import styles from "./page.module.css";

import Frame3 from "../assets/images/main/frame3.png";
import RightArrow from "@/components/icons/RightArrow";
import DownloadIcon from "@/components/icons/DownloadIcon";
import Square from "@/components/main/square";

export default function Home() {
    const [token, setToken] = useState<String | null>(null);

    const [users, setUsers] = useState<Number | null>(0);

    const serverIp = process.env.serverIp;

    useEffect(() => {
        if (typeof window !== "undefined" && window.localStorage) {
            let userToken = localStorage.getItem("token");
            if (userToken) setToken(userToken);
        }
    }, [token]);

    useEffect(() => {
        fetch(serverIp + "/info", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then((resp) => resp.json())
            .then((data) => {
                setUsers(data.users);
            });
    }, []);

    return (
        <main className={styles.main}>
            <Header token={token} />

            <div className={styles.mainSiteContent} aria-description="Conteudo principal do site">
                <section className={styles.mainTopContent} aria-description="Conteudo topo">
                    <div className={styles.sideItem}>
                        <div className={styles.textContent}>
                            <div>
                                <p className={styles.textContentDescription}>
                                    Uma <span className={styles.gradient}>descricao</span>
                                    <br />
                                    muito boa para isto
                                </p>
                            </div>

                            <div className={styles.mainTopButtons}>
                                {token ? (
                                    <div>
                                        <Link href="/auth/login">
                                            <div>
                                                <p>
                                                    Bem-Vindo
                                                    <RightArrow />
                                                </p>
                                            </div>
                                        </Link>
                                    </div>
                                ) : (
                                    <div>
                                        <Link href="/auth/login">
                                            <div>
                                                <p>
                                                    Entre AGORA
                                                    <RightArrow />
                                                </p>
                                            </div>
                                        </Link>
                                    </div>
                                )}

                                <a href="https://google.pt">
                                    <DownloadIcon />
                                    Transferir umnome
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className={styles.sideItem}>
                        <img src={Frame3.src} alt="Uma imagem a relatar sobre o produto" />
                    </div>
                </section>

                <section>
                    <div className={styles.activeUsers}>
                        <p>Junte-se agora a {Number(users)} utilizadores.</p>
                        {token ? (
                            <Link href="/auth/login">
                                Bem Vindo
                                <RightArrow />
                            </Link>
                        ) : (
                            <Link href="/auth/login">
                                Entre AGORA
                                <RightArrow />
                            </Link>
                        )}
                    </div>
                </section>

                <section className={styles.squareSection}>
                    <Square
                        title="Livrarias usadas no projeto"
                        content="<a href='//github.com/atjoao/umnome-backend'>Backend</a>: ExpressJS, MongoDB, FFMpeg*q*<a href='//github.com/atjoao/umnome-server'>Server</a>: Socket-IO*q*<a href='//github.com/atjoao/umnome-frontend'>Frontend</a>: NextJS (React), date-fns"
                    />
                    <Square title="Eu nao sei o que meter aqui depois vejo" content="um dia descubro" />
                    <Square
                        content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec ultrices nulla. Integer quis suscipit mi, id feugiat nisl. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Phasellus rhoncus magna et diam ultricies, vitae dictum quam fringilla. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec ultrices nulla. Integer quis suscipit mi, id feugiat nisl. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Phasellus rhoncus magna et diam ultricies, vitae dictum quam fringilla."
                        title="Sinceramente um texto longo"
                    />
                </section>

                <footer className={styles.footer}>
                    <p>
                        Criado por <a href="https://github.com/atjoao">João</a> em 2023 !1!!!1! acabado em 2024
                    </p>
                </footer>
            </div>
        </main>
    );
}
