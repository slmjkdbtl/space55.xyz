import {
	createServer,
	files,
	dir,
	route,
} from "./www"
import filehost from "./filehost"
import index from "./index"

const server = createServer({ port: Bun.env["PORT"] ?? 80 })
console.log(`server starting at http://${server.hostname}:${server.port}`)

const linksText = await Bun.file("files/links.txt").text()
const links = linksText.split("\n").filter((l) => l)
const rand = (a: number, b: number) => Math.floor(a + Math.random() * (b - a))

server.use(files("/static", "static"))
server.use(dir("/files", "files"))
server.use(route("GET", "/", ({ res }) => res.sendHTML(index)))
server.use(route("GET", "/ip", ({ req, res }) => res.sendJSON(req.ip)))
server.use(route("/tmpfile", filehost))
server.use(route("GET", "/randomlink", ({ res }) => res.redirect(links[rand(0, links.length)], { status: 303 })))

server.error(({ req, res }, err) => {
	console.error(`Time: ${new Date()}`)
	console.error(`Request: ${req.method} ${req.url}`)
	console.error("")
	console.error(err)
	res.sendText("server error", { status: 500 })
})

server.notFound(({ res }) => res.sendText("404", { status: 404 }))
