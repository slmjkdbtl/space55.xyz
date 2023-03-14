import { createServer, res } from "./www.js"
import index from "./index.js"

const server = createServer()
const linksText = await Bun.file("static/files/links.txt").text()
const links = linksText.split("\n").filter((l) => l)

server.files("/static/", "static")
server.get("/", () => res.html(index))
server.get("/randomlink", () => res.redirect(links[Math.floor(Math.random() * links.length)], 303))

export default {
	port: 4000,
	fetch: server.fetch,
}
