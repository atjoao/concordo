import React, { useEffect, useState } from "react";
import TypeIcon from "../icons/TypeIcon";
import styles from "./FileRender.module.css";
import DownloadIcon from "../icons/DownloadIcon";
import { createPortal } from "react-dom";
import ImageOverlay from "./ImageOverlay";
import LoadingIcon from "../icons/loading/LoadingIcon";

function calculateSize(size: number | undefined) {
    if (!size) return "Não consegui calcular";
    if (size >= 1024 * 1024) {
        const sizeInMB = (size / (1024 * 1024)).toFixed(2);
        return `${sizeInMB} MB`;
    } else if (size >= 1024) {
        const sizeInKB = (size / 1024).toFixed(2);
        return `${sizeInKB} KB`;
    } else {
        return `${size} bytes`;
    }
}

export default function FileRender({ file_blob, file_url, file_name, bottomRef }: any) {
    const [contentType, setContentType] = useState<"video" | "image" | null>(null);
    const [ImgError, setImgError] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const [file, setFile] = useState<Blob | any>(undefined);
    const [fileError, setFileError] = useState<boolean>(false);

    const [overlayVisible, setOverlayVisible] = useState(false);
    const [mimeType, setMimeType] = useState<string | undefined>(undefined);

    const openOverlay = () => {
        setOverlayVisible(true);
    };

    const closeOverlay = () => {
        setOverlayVisible(false);
    };

    useEffect(() => {
        console.log(typeof file_blob);

        if (file_blob && !file_name) {
            setFile(file_blob);
            if (file_blob.type.startsWith("image/")) {
                setContentType("image");
                setLoading(false);
            } else if (file_blob.type.startsWith("video/")) {
                setContentType("video");
                setLoading(false);
            } else {
                setImgError(true);
                setLoading(false);
            }
            return;
        }
        fetch(file_url + "?optimize=true")
            .then(async (resp: any) => {
                if (!resp.ok) {
                    throw new Error("Este ficheiro nao foi encontrado.");
                }
                const contentType = resp.headers.get("content-type");
                setMimeType(String(contentType));

                const blob = await resp.blob();

                setFile(blob);

                if (!contentType) {
                    setImgError(true);
                    setLoading(false);
                    return;
                }

                if (contentType.startsWith("image/")) {
                    setContentType("image");
                    setLoading(false);
                } else if (contentType.startsWith("video/")) {
                    setContentType("video");
                    setLoading(false);
                } else {
                    setImgError(true);
                    setLoading(false);
                }
            })
            .catch((erro) => {
                console.log(erro);
                setFileError(true);
                setLoading(false);
                setFile(undefined);
            });
    }, []);

    return (
        <>
            {!loading ? (
                <>
                    {fileError ? (
                        <div className={styles.fileDownload}>
                            <p>Este ficheiro não existe nos servidores</p>
                        </div>
                    ) : (
                        <>
                            {ImgError ? (
                                <div className={styles.fileDownload}>
                                    <TypeIcon file={file} />
                                    <div>
                                        <a href={file_url}>{file_name}</a>
                                        <p>Tamanho: {calculateSize(file?.size)}</p>
                                        <div className={styles.download}>
                                            <a href={file_url}>
                                                <DownloadIcon />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {contentType === "image" && (
                                        <>
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={"Imagem " + file_name}
                                                style={{
                                                    objectFit: "cover",
                                                    height: "250px",
                                                    maxHeight: "500px",
                                                    maxWidth: "512px",
                                                    objectPosition: "50% 50%",
                                                    borderRadius: "5px",
                                                }}
                                                onClick={openOverlay}
                                            />
                                            {overlayVisible &&
                                                createPortal(
                                                    <ImageOverlay file={file} onClose={closeOverlay} url={file_url} />,
                                                    document.body
                                                )}
                                        </>
                                    )}

                                    {contentType === "video" && (
                                        <video
                                            style={{
                                                objectFit: "contain",
                                                height: "250px",
                                                maxHeight: "500px",
                                                maxWidth: "512px",
                                                objectPosition: "50% 50%",
                                                borderRadius: "5px",
                                            }}
                                            onError={() => setImgError(true)}
                                            controls
                                        >
                                            <source src={URL.createObjectURL(file)} type={mimeType} />
                                        </video>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </>
            ) : (
                <div className={styles.fileLoader}>
                    <div className={styles.fileLoaderOverlay}>
                        <LoadingIcon />
                    </div>

                    <img
                        src={file_url + "?blur=true"}
                        style={{
                            objectFit: "cover",
                            height: "250px",
                            maxWidth: "512px",
                            borderRadius: "5px",
                        }}
                    />
                </div>
            )}
        </>
    );
}
