import React from "react";

interface PreloadProps {
    children: React.ReactNode;
}
// make it so react render the children
// so the browser can setup everything
// before showing the component

const Preload: React.FC<PreloadProps> = ({ children }) => {
    return <div style={{ display: "none" }}>{children}</div>;
};

export default Preload;
