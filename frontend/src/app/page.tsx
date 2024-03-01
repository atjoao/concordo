"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/header";
import styles from "./page.module.css";

import Frame3 from "../assets/images/main/laptop.png";
import RightArrow from "@/components/icons/RightArrow";
import Square from "@/components/main/square";
import { destroyEverything, socket } from "@/lib/socket/client";

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
        if (socket?.connected) destroyEverything();
    }, []);

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
                                    Uma coisa de comunicação
                                    <br />
                                    feita em <span className={styles.gradient}>Javascript</span>
                                    <br />
                                    para projeto escolar.
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
                            </div>
                        </div>
                    </div>

                    <div className={styles.sideItem}>
                        <img width="100%" src={Frame3.src} alt="Uma imagem a relatar sobre o produto" />
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
                        title="Tecnologias usadas no projeto"
                        content="<a href='https://github.com/atjoao/concordo/tree/main/backend'>Backend</a>: ExpressJS, FFMpeg*q*<a href='https://github.com/atjoao/concordo/tree/main/server'>Server</a>: Socket-IO*q*<a href='https://github.com/atjoao/concordo/tree/main/frontend'>Frontend</a>: NextJS (React), date-fns*q*<a href='#'>Database</a>: MongoDB*q*Ferramenta de design: Figma"
                    />
                    <Square
                        title="Icons"
                        content="Os icones foram todos retirados do site:*q*<a href='https://www.svgrepo.com/'>SVGRepo</a>"
                    />
                    <Square
                        title="Aprendido com o projeto"
                        content="Manuseamento de dados, databases, autenticação e comunicação em tempo real entre um cliente e um servidor, fazer layouts/design para um site com figma, e aprender a programar com React(NextJS)."
                    />
                </section>

                <footer className={styles.footer}>
                    <p>
                        Criado por <a href="https://github.com/atjoao">João</a> em 2023 !1!!!1! acabado em 2024 !1!1!1
                        (Feito em ambito escolar)
                    </p>
                </footer>
            </div>
        </main>
    );
}
