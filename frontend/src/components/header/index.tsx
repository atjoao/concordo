"use client";
import { headerData } from "@/lib/interfaces";
import styles from "./header.module.css";
import Link from "next/link";
import concordo from "../../assets/images/main/concordo.png";

import { Comic_Neue } from "next/font/google";

const ComicNeue = Comic_Neue({
    weight: "400",
    subsets: ["latin"],
});

const Header = ({ token }: headerData) => {
    return (
        <header className={styles.header}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <img style={{ height: "40px" }} src={concordo.src} alt="Logo" />
                <p
                    style={{
                        color: "#000",
                        fontSize: "30px",
                        marginLeft: "-20px",
                        fontFamily: ComicNeue.style.fontFamily,
                    }}
                >
                    Concordo | Dev
                </p>
            </div>
            {token ? <Link href="/auth/login">Abrir Concordo</Link> : <Link href="/auth/login">Entrar</Link>}
        </header>
    );
};

export default Header;
