import { createServer, res } from "./www.js"
import index from "./index.js"

const server = createServer()
const linksText = await Bun.file("files/links.txt").text()
const links = linksText.split("\n").filter((l) => l)
const rand = (a, b) => Math.floor(a + Math.random() * (b - a))

server.files("/static/", "static")
server.dir("/files/", "files")
server.get("/", () => res.html(index))
server.get("/randomlink", () => res.redirect(links[rand(0, links.length)]))

export default {
	port: Bun.env["PORT"] ?? 80,
	fetch: server.fetch,
}
