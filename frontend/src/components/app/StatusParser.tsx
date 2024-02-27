import ErrorIcon from "../icons/ErrorIcon";
import CheckmarkTickIcon from "../icons/CheckmarkTickIcon";
import InfoIcon from "../icons/InfoIcon";

export default function StatusParser({ setStatus, status, message }: any) {
    setTimeout(() => {
        setStatus(null);
    }, 5000);

    return (
        <p
            id="statusTimeout"
            style={{
                backgroundColor:
                    status === "error" || status === "not_verified"
                        ? "var(--red2)"
                        : status == "sent" || status === "accepted"
                        ? "var(--greenDark)"
                        : status == "info"
                        ? "var(--blue)"
                        : "none",
                padding: "10px 5px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#FFF",
            }}
        >
            {(status === "error" || status === "not_verified") && <ErrorIcon />}
            {(status === "sent" || status === "accepted") && <CheckmarkTickIcon />}
            {status === "info" && <InfoIcon />}

            {message}
        </p>
    );
}
