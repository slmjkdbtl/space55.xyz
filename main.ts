import { createServer } from "./www"
import index from "./index"

const port = Bun.env["PORT"] ?? 80
const server = createServer({ port })
console.log(`server starting at http://localhost:${port}`)

const linksText = await Bun.file("files/links.txt").text()
const links = linksText.split("\n").filter((l) => l)
const rand = (a: number, b: number) => Math.floor(a + Math.random() * (b - a))

server.files("/static", "static")
server.dir("/files", "files")
server.get("/", ({ res }) => res.sendHTML(index))
server.get("/randomlink", ({ res }) => res.redirect(links[rand(0, links.length)]))
