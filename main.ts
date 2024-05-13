import {
	createServer,
	files,
	dir,
	route,
} from "./www"
import index from "./index"
import poop from "./poop"
import days from "./days"

const server = createServer()
console.log(`server starting at ${server.url.toString()}`)

const linksText = await Bun.file("files/links.txt").text()
const links = linksText.split("\n").filter((l) => l)
const rand = (a: number, b: number) => Math.floor(a + Math.random() * (b - a))
const randItem = <D>(arr: D[]) => arr[rand(0, arr.length)]

server.use(files("/static", "static"))
server.use(dir("/files", "files"))
server.use(route("GET", "/", ({ res }) => res.sendHTML(index)))
server.use(route("GET", "/poop", ({ res }) => res.sendHTML(poop)))
server.use(route("GET", "/days", ({ res }) => res.sendHTML(days)))
server.use(route("GET", "/randomlink", ({ res }) => res.redirect(randItem(links), 303)))

server.error(({ req, res }, err) => {
	console.error(`Time: ${new Date()}`)
	console.error(`Request: ${req.method} ${req.url}`)
	console.error("")
	console.error(err)
	res.sendText("server error", { status: 500 })
})

server.notFound(({ res }) => res.sendText("404", { status: 404 }))
