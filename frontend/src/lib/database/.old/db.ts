// fazer indexed storage aaaaaaaaa
export function iniciarDb(
	dbName: string,
	keyPath: string,
	autoIncrement: boolean
) {
	return new Promise((resolve, reject) => {
		const openDb: IDBOpenDBRequest = indexedDB.open(dbName)

		openDb.onupgradeneeded = () => {
			const db: IDBDatabase = openDb.result

			if (!db.objectStoreNames.contains(dbName)) {
				console.log("Database não existente a criar uma")
				db.createObjectStore(dbName, {
					keyPath: keyPath,
					autoIncrement: autoIncrement,
				})
			}
		}

		openDb.onsuccess = () => {
			resolve(true)
		}

		openDb.onerror = (e) => {
			console.log("opendb", e)
			reject(e)
		}
	})
}

export function checkDb(dbName: string, keyPath: string) {
	return new Promise((resolve, reject) => {
		const openDb: IDBOpenDBRequest = indexedDB.open(dbName)

		openDb.onsuccess = () => {
			const db = openDb.result
			const transaction = db.transaction([dbName], "readonly")

			const objectStore = transaction.objectStore(dbName)
			const getRequest = objectStore.get(keyPath)

			getRequest.onsuccess = (event: any) => {
				const existingData = event.target?.result
				const dataExists = existingData !== undefined

				resolve(dataExists)
			}

			getRequest.onerror = (e) => {
				console.log("checkdb", e)

				reject(e)
			}
		}

		openDb.onerror = (e) => {
			console.log("opendb", e)
			reject(e)
		}
	})
}

export function writeToDb(dbName: string, data: any) {
	return new Promise((resolve, reject) => {
		const openDb: IDBOpenDBRequest = indexedDB.open(dbName)

		openDb.onsuccess = () => {
			const db = openDb.result
			const transaction = db.transaction([dbName], "readwrite")

			const objectStore = transaction.objectStore(dbName)
			const adicionarDb = objectStore.add(data)

			adicionarDb.onsuccess = () => {
				resolve(true)
			}

			adicionarDb.onerror = (e) => {
				console.log("adicionarDb", e)

				reject(e)
			}
		}

		openDb.onerror = (e) => {
			console.log("opendb2", e)

			reject(e)
		}
	})
}
