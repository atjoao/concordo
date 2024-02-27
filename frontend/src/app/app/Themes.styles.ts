export type Theme = {
    name: string;
    textColor: string;
    textColor2?: string;

    textBgColor: string;
    promptAlt: string;
    homeIcon: string;

    bg1: string;
    bg2: string;
    bg3?: string;
    bg4?: string;
    bg5?: string;
    bg6?: string;

    bgActive: string;
    bgHover: string;
    bgHover2: string;

    green: string;
    greenLight: string;
    greenDark: string;

    red: string;
    red2: string;
    redDark: string;
    redHover: string;

    blue: string;
    blueText: string;

    selectBoxColor: string;
};

export type ThemeSelector = Record<string, Theme>;

export const themes: ThemeSelector = {
    default: {
        name: "Default",
        textColor: "#FFF",
        textColor2: "#000",
        homeIcon: "#d9d9d9",

        textBgColor: "#d9d9d9",

        bg1: "#616161",
        bg2: "#7c7c7c",
        bg3: "#4f4a4a",
        bg4: "#313030",
        bg5: "#b9b6b6",
        bg6: "#413f4b",

        promptAlt: "#1c1c1c",

        bgActive: "rgba(169, 169, 169, 0.2)",
        bgHover: "rgba(169, 169, 169, 0.2)",
        bgHover2: "rgb(153, 153, 153)",

        green: "#668a6e",
        greenDark: "#4a6950",
        greenLight: "#668a6e",

        red: "red",
        red2: "#c12929",
        redDark: "#b84242",
        redHover: "rgb(161, 15, 15)",

        blue: "#2d6097",
        blueText: "#9bcbff",
        selectBoxColor: "rgb(157, 157, 157)",
    },

    whitemode: {
        name: "Modo Claro",
        textColor: "#000",
        textColor2: "#000",
        textBgColor: "#a8a8a8",
        homeIcon: "#8e8e8e",

        bg1: "#fff",
        bg2: "#eee",
        bg3: "#e5e5e5",
        bg4: "#bbb",
        bg5: "#d7d7d7",
        promptAlt: "#1c1c1c",
        //eee
        bgActive: "#ccc",
        bgHover: "#a9a9a933",
        bgHover2: "rgb(153, 153, 153)",

        green: "#82cf93",
        greenLight: "#61996d",
        greenDark: "#4a6950",

        red: "#ff0000",
        red2: "#c12929",

        redDark: "#c12929",
        redHover: "#a10f0f",

        blue: "#2d6097",
        blueText: "#0006ff",
        selectBoxColor: "rgb(0, 77, 128)",
    },

    puredark: {
        name: "Modo escuro",
        bg1: "#000",
        bg2: "rgba(169, 169, 169, 0.2)",
        bg3: "#000",
        bg4: "rgba(0, 0, 0, 0.81)",
        promptAlt: "#1c1c1c",
        textColor: "#FFF",
        textColor2: "#FFF",
        homeIcon: "#FFF",
        textBgColor: "rgba(169, 169, 169, 0.2)",

        bgActive: "rgba(169, 169, 169, 0.2)",
        bgHover: "rgba(169, 169, 169, 0.2)",
        bgHover2: "rgb(153, 153, 153)",

        green: "#668a6e",
        greenDark: "#4a6950",
        greenLight: "#668a6e",

        red: "red",
        red2: "#c12929",
        redDark: "#b84242",
        redHover: "rgb(161, 15, 15)",

        blue: "#2d6097",
        blueText: "#9bcbff",
        selectBoxColor: "rgb(157, 157, 157)",
    },
};
