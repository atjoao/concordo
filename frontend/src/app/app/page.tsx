"use client";

import styles from "./page.module.css";
import { useEffect, useState } from "react";
import AllFriendsTab from "@/components/app/MainPageTabs/AllFriendsTab";
import AllFriendsOnlineTab from "@/components/app/MainPageTabs/AllFriendsOnlineTab";
import BlockedTab from "@/components/app/MainPageTabs/BlockedTab";
import AddFriendTab from "@/components/app/MainPageTabs/AddFriendTab";
import FriendRequestsTab from "@/components/app/MainPageTabs/FriendsRequestsTab";

export default function Page() {
    const [currentTab, setCurrentTab] = useState<String>("tab-AllFriendsOnline");

    return (
        <>
            <div className={styles.tabSwitcher}>
                <ul>
                    <li
                        className={currentTab === "tab-AllFriendsOnline" ? styles.active : ""}
                        onClick={() => setCurrentTab("tab-AllFriendsOnline")}
                    >
                        Online
                    </li>
                    <li
                        className={currentTab === "tab-AllFriends" ? styles.active : ""}
                        onClick={() => setCurrentTab("tab-AllFriends")}
                    >
                        Todos
                    </li>
                    <li
                        className={currentTab === "tab-FriendRequests" ? styles.active : ""}
                        onClick={() => setCurrentTab("tab-FriendRequests")}
                    >
                        Pedidos Recebidos
                    </li>
                    <li
                        className={currentTab === "tab-Blocked" ? styles.active : ""}
                        onClick={() => setCurrentTab("tab-Blocked")}
                    >
                        Bloqueados
                    </li>
                    <li
                        className={currentTab != "tab-addFriend" ? styles.greenTab : styles.greenTabActive}
                        onClick={() => setCurrentTab("tab-addFriend")}
                    >
                        Adicionar amigo
                    </li>
                </ul>
            </div>

            <div className={styles.tabContent}>
                {currentTab == "tab-AllFriendsOnline" && <AllFriendsOnlineTab />}
                {currentTab == "tab-AllFriends" && <AllFriendsTab />}
                {currentTab == "tab-FriendRequests" && <FriendRequestsTab />}
                {currentTab == "tab-Blocked" && <BlockedTab />}
                {currentTab == "tab-addFriend" && <AddFriendTab />}
            </div>
        </>
    );
}
