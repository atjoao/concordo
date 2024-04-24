import CloseIcon from "@/components/icons/CloseIcon";
import { useState } from "react";

interface TopBarNotifierProps {
    closed: boolean;
    color: string;
    message: string;
}

const TopBarNotifier: React.FC<TopBarNotifierProps> = (content) => {
    const [close, setClose] = useState<boolean>(content.closed);

    const handleClose = () => {
        setClose(true);
    };

    return (
        !close && (
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 10%",
                    zIndex: 9999,
                    position: "absolute",
                    outline: "1px solid black",
                    background: content.color,
                    borderEndEndRadius: 10,
                    borderBottomLeftRadius: 10,
                }}
            >
                <p
                    style={{
                        color: "var(--redText)",
                    }}
                >
                    {content.message}
                </p>
                <span
                    style={{
                        transition: "all 0.3s",
                        width: 30,
                        height: 30,
                        cursor: "pointer",
                        borderRadius: 5,
                        outline: "1px solid #1F2328",
                    }}
                    onClick={handleClose}
                    onMouseEnter={(e) => {
                        const el = e.currentTarget.children[0].lastChild as HTMLElement;

                        e.currentTarget.style.backgroundColor = "red";
                        e.currentTarget.style.outlineColor = "var(--textBgColor)";
                        if (el && el.style) {
                            el.style.fill = "white";
                        }
                    }}
                    onMouseLeave={(e) => {
                        const el = e.currentTarget.children[0].lastChild as HTMLElement;

                        e.currentTarget.style.outlineColor = "#1F2328";
                        e.currentTarget.style.backgroundColor = "unset";
                        if (el && el.style) {
                            el.style.fill = "#1F2328";
                        }
                    }}
                >
                    <CloseIcon />
                </span>
            </div>
        )
    );
};

export default TopBarNotifier;
