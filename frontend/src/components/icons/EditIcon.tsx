export default function EditIcon(color: { color?: string }) {
    return (
        <>
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M3.77401 8.57217L3.35467 8.15283L4.61268 6.89482L6.91717 4.59033L8.17518 3.33232L8.59452 3.75166L9.43319 4.59033L16.8254 11.9825C17.2113 12.3685 17.4933 12.8472 17.6492 13.3704L18.9629 17.8384C19.0556 18.1501 18.9703 18.4878 18.7365 18.7179C18.5027 18.948 18.1687 19.0333 17.857 18.9442L13.3928 17.6306C12.8695 17.4747 12.3908 17.1927 12.0049 16.8067L4.61268 9.41455L3.77401 8.57217ZM13.0625 14.8214L13.4002 15.6638C13.5486 15.7788 13.7156 15.8642 13.8937 15.9198L16.7957 16.7733L15.9422 13.8751C15.8902 13.6933 15.8012 13.5263 15.6861 13.3815L14.8437 13.0438V14.2313C14.8437 14.5579 14.5765 14.8251 14.25 14.8251H13.0625V14.8214ZM5.54041 0.693848L6.07479 1.23193L6.91346 2.07061L7.33651 2.48994L6.0785 3.74795L3.77401 6.05244L2.516 7.31045L2.09666 6.89111L1.25799 6.05244L0.719906 5.51436C-0.207829 4.58662 -0.207829 3.08369 0.719906 2.15596L2.1783 0.693848C3.10604 -0.233887 4.60897 -0.233887 5.5367 0.693848H5.54041ZM7.2994 6.92822L12.6431 12.272C12.8732 12.5021 13.2517 12.5021 13.4818 12.272C13.7119 12.0419 13.7119 11.6634 13.4818 11.4333L8.13807 6.08955C7.90799 5.85947 7.52948 5.85947 7.2994 6.08955C7.06932 6.31963 7.06932 6.69815 7.2994 6.92822Z"
                    fill={color.color ? color.color : "var(--textColor2)"}
                />
            </svg>
        </>
    );
}
