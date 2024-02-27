"use client";

import { useContext } from "react";
import styles from "./Sidebar.module.css";
import ChatsIndex from "./ChatsIndex";
import { LayoutCached } from "@/app/app/layout";

function BottomBar({ serverIp, profile, toggleSettings, photo }: any) {
    return (
        <div className={styles.bottombar}>
            <div className={styles.bottombarProfile}>
                <img src={photo ? URL.createObjectURL(photo) : serverIp + "/avatar/" + profile.info.id} />
                <div>
                    <p>
                        {profile.info.username}#{profile.info.descrim}
                    </p>
                    <span>🟢 Online</span>
                </div>
            </div>
            <div className={styles.config} onClick={toggleSettings}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M30.0774 10.4125C30.2774 10.9563 30.1086 11.5625 29.6774 11.95L26.9711 14.4125C27.0399 14.9313 27.0774 15.4625 27.0774 16C27.0774 16.5375 27.0399 17.0688 26.9711 17.5875L29.6774 20.05C30.1086 20.4375 30.2774 21.0437 30.0774 21.5875C29.8024 22.3312 29.4711 23.0438 29.0899 23.7313L28.7961 24.2375C28.3836 24.925 27.9211 25.575 27.4149 26.1875C27.0461 26.6375 26.4336 26.7875 25.8836 26.6125L22.4024 25.5063C21.5649 26.15 20.6399 26.6875 19.6524 27.0938L18.8711 30.6625C18.7461 31.2313 18.3086 31.6812 17.7336 31.775C16.8711 31.9187 15.9836 31.9937 15.0774 31.9937C14.1711 31.9937 13.2836 31.9187 12.4211 31.775C11.8461 31.6812 11.4086 31.2313 11.2836 30.6625L10.5024 27.0938C9.51486 26.6875 8.58986 26.15 7.75236 25.5063L4.27736 26.6187C3.72736 26.7937 3.11486 26.6375 2.74611 26.1938C2.23986 25.5813 1.77736 24.9312 1.36486 24.2437L1.07111 23.7375C0.68986 23.05 0.35861 22.3375 0.0836098 21.5938C-0.11639 21.05 0.0523598 20.4438 0.48361 20.0562L3.18986 17.5938C3.12111 17.0688 3.08361 16.5375 3.08361 16C3.08361 15.4625 3.12111 14.9313 3.18986 14.4125L0.48361 11.95C0.0523598 11.5625 -0.11639 10.9563 0.0836098 10.4125C0.35861 9.66875 0.68986 8.95625 1.07111 8.26875L1.36486 7.7625C1.77736 7.075 2.23986 6.425 2.74611 5.8125C3.11486 5.3625 3.72736 5.2125 4.27736 5.3875L7.75861 6.49375C8.59611 5.85 9.52111 5.3125 10.5086 4.90625L11.2899 1.3375C11.4149 0.76875 11.8524 0.31875 12.4274 0.225C13.2899 0.075 14.1774 0 15.0836 0C15.9899 0 16.8774 0.075 17.7399 0.21875C18.3149 0.3125 18.7524 0.7625 18.8774 1.33125L19.6586 4.9C20.6461 5.30625 21.5711 5.84375 22.4086 6.4875L25.8899 5.38125C26.4399 5.20625 27.0524 5.3625 27.4211 5.80625C27.9274 6.41875 28.3899 7.06875 28.8024 7.75625L29.0961 8.2625C29.4774 8.95 29.8086 9.6625 30.0836 10.4062L30.0774 10.4125ZM15.0836 21C16.4097 21 17.6815 20.4732 18.6191 19.5355C19.5568 18.5979 20.0836 17.3261 20.0836 16C20.0836 14.6739 19.5568 13.4021 18.6191 12.4645C17.6815 11.5268 16.4097 11 15.0836 11C13.7575 11 12.4858 11.5268 11.5481 12.4645C10.6104 13.4021 10.0836 14.6739 10.0836 16C10.0836 17.3261 10.6104 18.5979 11.5481 19.5355C12.4858 20.4732 13.7575 21 15.0836 21Z"
                        fill="#C4C4C4"
                        stroke="black"
                    />
                </svg>
            </div>
        </div>
    );
}

export default function Sidebar({ router, toggleSettings }: any) {
    const { serverIp, profile, photo }: any = useContext(LayoutCached);

    return (
        <>
            <div className={styles.sidebar}>
                <ChatsIndex profile={profile} />
                <BottomBar photo={photo} serverIp={serverIp} profile={profile} toggleSettings={toggleSettings} />
            </div>
        </>
    );
}
