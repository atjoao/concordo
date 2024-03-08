import styles from "./concordoLoading.module.css";

export default function ConcordoLoading() {
    return (
        <div className={styles.icon}>
            <svg width="101" height="85" viewBox="0 0 101 85" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_d_1_145)">
                    <path
                        d="M90.5 71L86.5 65.5C83.1805 61.3995 89 68.5 79 60.5C69 52.5 73 57.1893 73 57.1893L65 55H44.5H27.5H22.5L5 54V13.5V9.5L7 6.5L11 4.75L15 2H19.5H22.5H27.5L33 1L60.5 2H65L73 3L80.5 6.5L83.5 9.5L85 12.5L86.5 15.5L88 19.5L96 65.5V76L90.5 71Z"
                        fill="#655D5D"
                        className={styles.svgElem1}
                    ></path>
                    <path
                        d="M90.5 71L86.5 65.5C83.1805 61.3995 89 68.5 79 60.5C69 52.5 73 57.1893 73 57.1893L65 55H44.5H27.5H22.5L5 54V13.5V9.5L7 6.5L11 4.75L15 2H19.5H22.5H27.5L33 1L60.5 2H65L73 3L80.5 6.5L83.5 9.5L85 12.5L86.5 15.5L88 19.5L96 65.5V76L90.5 71Z"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="square"
                        strokeLinejoin="round"
                        strokeDasharray="4 4"
                        className={styles.svgElem2}
                    ></path>
                </g>
                <path
                    d="M25.4426 18.4837C27.5902 18.4837 29.7242 18.2933 31.8737 18.2933C37.7121 18.2933 43.5273 18.7551 49.3582 18.8539C52.2685 18.9033 55.9537 18.3093 58.7616 19.2453"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className={styles.svgElem3}
                ></path>
                <path
                    d="M35.9143 28.8611C40.0557 29.1796 44.3133 29.9271 48.4697 29.5275C50.1159 29.3692 51.6294 29.5923 53.2401 29.6227C56.1372 29.6773 58.9771 30.765 61.8079 30.765"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className={styles.svgElem4}
                ></path>
                <path
                    d="M48.6707 39.5232C53.5832 39.5232 58.6497 39.3104 63.5214 40.2847"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className={styles.svgElem5}
                ></path>
                <defs>
                    <filter
                        id="filter0_d_1_145"
                        x="0"
                        y="0"
                        width="101"
                        height="85"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                    >
                        <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
                        <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                        ></feColorMatrix>
                        <feOffset dy="4"></feOffset>
                        <feGaussianBlur stdDeviation="2"></feGaussianBlur>
                        <feComposite in2="hardAlpha" operator="out"></feComposite>
                        <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                        ></feColorMatrix>
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_145"></feBlend>
                        <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="effect1_dropShadow_1_145"
                            result="shape"
                        ></feBlend>
                    </filter>
                </defs>
            </svg>
        </div>
    );
}
