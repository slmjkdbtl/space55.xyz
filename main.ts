import { $ } from "bun"
import {
	isDev,
	createServer,
	files,
	dir,
	route,
} from "./www"
import index from "./index"
import poop from "./poop"
import days from "./days"
import resume from "./resume"
import jap from "./jap"

// TODO: live reload

if (isDev) {
	await $`make fonts`
}

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
server.use(route("GET", "/resume", ({ res }) => res.sendHTML(resume)))
server.use(route("GET", "/portfolio", ({ res }) => res.sendHTML(resume)))
server.use(route("GET", "/jap", ({ res }) => res.sendHTML(jap)))
server.use(route("GET", "/randomlink", ({ res }) => res.redirect(randItem(links), 303)))
