import {
	createServer,
	files,
	filebrowser,
	route,
} from "www/server"
import index from "./index"
import games from "./games"
import poop from "./poop"
import days from "./days"
import resume from "./resume"
import littlesongs from "./littlesongs"
import fantasyspinkick from "./fantasyspinkick"
import * as blog from "./blog"
import * as tmp from "./tmp"

const server = createServer()
console.log(`server starting at ${server.url.toString()}`)

const linksText = await Bun.file("files/links.txt").text()
const links = linksText.split("\n").filter((l) => l)
const rand = (a: number, b: number) => Math.floor(a + Math.random() * (b - a))
const randItem = <D>(arr: D[]) => arr[rand(0, arr.length)]

server.use(files("/static", "static"))
server.use(filebrowser("/files", "files"))
server.use(route("GET", "/", ({ res }) => res.sendHTML(index)))
server.use(route("GET", "/games", ({ res }) => res.sendHTML(games)))
server.use(route("GET", "/poop", ({ res }) => res.sendHTML(poop)))
server.use(route("GET", "/days", ({ res }) => res.sendHTML(days)))
server.use(route("GET", "/resume", ({ res }) => res.sendHTML(resume)))
server.use(route("GET", "/lilfang", ({ res }) => res.redirect("/files/lilfang/index.html")))
server.use(route("GET", "/littlesongs", ({ res }) => res.sendHTML(littlesongs)))
server.use(route("GET", "/fantasyspinkick", ({ res }) => res.sendHTML(fantasyspinkick)))
server.use(blog.router.mount("/blog"))
server.use(route("GET", "/randomlink", ({ res }) => res.redirect(randItem(links))))
server.use(tmp.router.mount("/tmp"))
