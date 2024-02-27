import { useState } from "react";
import ErrorIcon2 from "./ErrorIcon2";

function ImageFallback(props: { file: File | Blob }) {
    const [error, setError] = useState<boolean>(false);

    const handleError = () => {
        setError(true);
    };

    return (
        <>
            {error ? (
                <ErrorIcon2 />
            ) : (
                <img
                    className={"image_" + props.file.name.replace(" ", "_")}
                    src={URL.createObjectURL(props.file)}
                    onError={handleError}
                    alt={"Imagem carregada " + props.file.name}
                    width="100px"
                    height="100px"
                    style={{ objectFit: "contain" }}
                />
            )}
        </>
    );
}

export default function TypeIcon(props: { file: File | Blob | undefined }) {
    switch (props.file?.type) {
        case "image/jpeg":
        case "image/png":
        case "image/webp":
            return <ImageFallback file={props.file} />;

        case "text/plain":
            return (
                <svg width="100px" height="100px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M18,22H6a2,2,0,0,1-2-2V4A2,2,0,0,1,6,2h7.1a2,2,0,0,1,1.5.6l4.9,5.2A2,2,0,0,1,20,9.2V20A2,2,0,0,1,18,22Z"
                        fill="none"
                        id="File"
                        stroke="#000000"
                        strokeLinecap={"round"}
                        strokeLinejoin={"round"}
                        strokeWidth={1.2}
                    />
                    <line
                        fill="none"
                        stroke="#000000"
                        strokeLinecap={"round"}
                        strokeLinejoin={"round"}
                        strokeWidth={1}
                        x1="9"
                        x2="15"
                        y1="16.5"
                        y2="16.5"
                    />
                </svg>
            );

        default:
            return (
                <svg width="100px" height="100px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <g>
                        <path
                            d="M18,22H6a2,2,0,0,1-2-2V4A2,2,0,0,1,6,2h7.1a2,2,0,0,1,1.5.6l4.9,5.2A2,2,0,0,1,20,9.2V20A2,2,0,0,1,18,22Z"
                            fill="none"
                            id="File"
                            stroke="#000000"
                            strokeLinecap={"round"}
                            strokeLinejoin={"round"}
                            strokeWidth={1.2}
                        />
                    </g>
                </svg>
            );
    }
}
