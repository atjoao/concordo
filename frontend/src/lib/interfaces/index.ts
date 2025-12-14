import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface serverData {
    users: Number;
}

export interface headerData {
    token: String | null;
}

export interface layout {
    children: React.ReactNode;
    [key: string]: any;
}

export interface formProps {
    dialogSetState: any;
    dialogSetError: any;
    serverIp: any;
    changeServerDialog?: any;
    router?: AppRouterInstance;
    setRedirectingState?: React.Dispatch<React.SetStateAction<boolean>>;
    email?: string | any;
    chave?: string | any;
    status?: any;
}

export interface perfilData {
    _id: any;
    descrim: String;
    username: String;
}

export interface IchatMessages {
    headerInfo: any;
    setHeaderInfo: React.Dispatch<React.SetStateAction<any>>;
    messages: any;
    setMessages: React.Dispatch<React.SetStateAction<any>>;
    messageCount: number;
    setMessageCount: React.Dispatch<React.SetStateAction<any>>;
    editMessage: any;
    setEditMessage: React.Dispatch<React.SetStateAction<any>>;
    editingInput: boolean;
    lastMessage: any;
    setLastMessage: React.Dispatch<React.SetStateAction<any>>;
    setEditingInput: React.Dispatch<React.SetStateAction<boolean>>;
    [x: string]: any;
}

export interface IChat {
    id?: string;
    members_id: string[];
    chatType: "PM" | "GP";
    chatName?: string;
    chatAvatar?: string;
    chatOwnerId?: string;
}
