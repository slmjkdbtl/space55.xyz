// fetch links from raindrop to links.txt
// https://developer.raindrop.io/v1/

const TOKEN = Bun.env["RAINDROP_TOKEN"]
const COLLECTION = "good"
const DEST = "files/links.txt"

if (!TOKEN) {
	console.error("RAINDROP_TOKEN not found in env!")
	process.exit(1)
}

const API_ROOT = "https://api.raindrop.io/rest/v1"
const PER_PAGE = 50
const headers = {
	"Authorization": `Bearer ${TOKEN}`,
}

type Collection = {
	_id: string,
	count: number,
	title: string
}

async function getCollections(): Promise<Collection[]> {
	const res = await fetch(`${API_ROOT}/collections`, {
		method: "GET",
		headers: headers,
	})
	const json = await res.json()
	return json.items
}

async function getRaindrops(collection: Collection) {
	async function getPage(p: number) {
		const params = new URLSearchParams({
			perpage: PER_PAGE + "",
			page: p + "",
		})
		const res = await fetch(`${API_ROOT}/raindrops/${collection._id}?${params}`, {
			method: "GET",
			headers: headers,
		})
		const json = await res.json()
		return json.items
	}
	const raindrops = []
	const pages = Math.ceil(collection.count / PER_PAGE)
	for (let i = 0; i < pages; i++) {
		raindrops.push(...(await getPage(i)))
	}
	return raindrops
}

const collections = await getCollections()
const collection = collections.find((c) => c.title === COLLECTION)

if (!collection) {
	console.error(`collection not found: ${COLLECTION}`)
	process.exit(1)
}

console.log(`fetching links...`)
const raindrops = await getRaindrops(collection)
Bun.write(DEST, raindrops.map((r) => r.link).join("\n"))
console.log(`links saved to ${DEST}`)
