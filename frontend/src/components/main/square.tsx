import React from "react"
import styles from "./squares.module.css"

interface props {
	title?: String | null
	content: String | null
}

const Square: React.FC<props> = ({ title, content }) => {
	return (
		<div className={styles.squareBody}>
			<p>{title}</p>
			{content?.split("*q*").map((string, index) => (
				<p dangerouslySetInnerHTML={{ __html: string }} key={index}></p>
			))}
		</div>
	)
}

export default Square
