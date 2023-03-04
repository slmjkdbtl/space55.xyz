import { createServer, html } from "./www.js"
import index from "./index.js"

const server = createServer()

server.files("/static/", "static")
server.get("/", () => html(index))

export default {
	port: 4000,
	fetch: server.fetch,
}
