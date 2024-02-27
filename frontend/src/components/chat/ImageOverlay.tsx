import React, { useEffect } from "react";
import styles from "./ImageOverlay.module.css";

interface ImageOverlayProps {
    file: File;
    onClose: () => void;
    url: string;
}

const ImageOverlay: React.FC<ImageOverlayProps> = ({ file, onClose, url }) => {
    useEffect(() => {
        function targetInput(e: KeyboardEvent) {
            if (e.key == "Escape") {
                onClose();
                return;
            }
        }

        document.addEventListener("keydown", targetInput);

        return () => {
            document.removeEventListener("keydown", targetInput);
        };
    }, [onClose]);

    return (
        <div
            className={styles.overlay}
            onClick={(e) => {
                const element: any = e.target;
                if (element.className == styles.overlay) {
                    onClose();
                }
            }}
        >
            <div className={styles.container}>
                <img src={URL.createObjectURL(file)} />
                <a href={url} target="_blank">
                    Abrir num novo separador
                </a>
            </div>
        </div>
    );
};

export default ImageOverlay;
