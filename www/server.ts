// helper functions for the world wide web with Bun

if (typeof Bun === "undefined") {
	throw new Error("requires bun")
}

import * as fs from "node:fs/promises"
import * as path from "node:path"
import * as sqlite from "bun:sqlite"

import {
	isDev,
	Registry,
	Event,
	EventController,
	mapValues,
	ansi,
	fmtBytes,
	mapAsync,
	isPromise,
	KV,
	parseKV,
	buildKV,
} from "./utils"

import {
	h,
	style,
	css,
} from "./html"

export type Req = {
	method: string,
	headers: Headers,
	url: URL,
	type: string | null,
	cookies: KV,
	text: () => Promise<string>,
	arrayBuffer: () => Promise<ArrayBuffer>,
	json<T = any>(): Promise<T>,
	formData: () => Promise<FormData>,
	blob: () => Promise<Blob>,
	params: Record<string, string>,
	ip: string | void,
	getBasicAuth: () => [string, string] | void,
	getBearerAuth: () => string | void,
}

export type Res = {
	status: number,
	headers: Headers,
	body: null | BodyInit,
	cookies: KV,
	send: (data?: BodyInit | null, opt?: ResOpt) => void,
	sendText: (content: string, opt?: ResOpt) => void,
	sendHTML: (content: string, opt?: ResOpt) => void,
	sendJSON: <T = any>(content: T, opt?: ResOpt) => void,
	sendFile: (path: string, opt?: SendFileOpt & ResOpt) => void,
	redirect: (url: string, opt?: RedirectOpt & ResOpt) => void,
	handled: boolean,
}

export type ResOpt = {
	headers?: Record<string, string>,
	status?: number,
}

export type SendFileOpt = {
	mimes?: Record<string, string>,
}

export type RedirectOpt = {
	permanent?: boolean,
	switchToGet?: boolean,
}

export type Ctx = {
	req: Req,
	res: Res,
}

export type Handler = (ctx: Ctx, next: () => Promise<void>) => void | Promise<void>
export type ErrorHandler = (ctx: Ctx, err: Error) => void

export type Server = {
	use: (handler: Handler) => void,
	error: (handler: ErrorHandler) => void,
	url: URL,
}

export type ServerOpts = {
	hostname?: string,
	port?: number,
}

// TODO: can pass a full Response
export class HTTPError extends Error {
	code: number
	constructor(code: number, msg: string) {
		super(msg)
		this.code = code
		this.name = "HTTPError"
	}
}

function createReq(req: Request, server: Bun.Server<any>): Req {

	const cookieStr = req.headers.get("Cookie")
	const cookies = cookieStr ? parseKV(cookieStr) : {}
	const ty = req.headers.get("Content-Type")?.split(";")[0] ?? null

	function getIP() {
		let ip = req.headers.get("X-Forwarded-For")?.split(",")[0].trim()
			?? server.requestIP(req)?.address
		if (!ip) return
		const ipv6Prefix = "::ffff:"
		// ipv4 in ipv6
		if (ip?.startsWith(ipv6Prefix)) {
			ip = ip.substring(ipv6Prefix.length)
		}
		const localhostIPs = new Set([
			"127.0.0.1",
			"::1",
		])
		if (localhostIPs.has(ip)) return
		return ip
	}

	function getBasicAuth(): [string, string] | void {
		const auth = req.headers.get("Authorization")
		if (!auth) return
		const [ scheme, cred ] = auth.split(" ")
		if (scheme.toLowerCase() !== "basic") return
		if (!cred) return
		const [ user, pass ] = atob(cred).split(":")
		return [ user, pass ]
	}

	function getBearerAuth(): string | void {
		const auth = req.headers.get("Authorization")
		if (!auth) return
		const [ scheme, cred ] = auth.split(" ")
		if (scheme.toLowerCase() !== "bearer") return
		return cred
	}

	return {
		method: req.method,
		url: new URL(req.url),
		headers: req.headers,
		text: req.text.bind(req),
		json: req.json.bind(req),
		arrayBuffer: req.arrayBuffer.bind(req),
		formData: req.formData.bind(req),
		blob: req.blob.bind(req),
		cookies,
		ip: getIP(),
		type: ty,
		params: {},
		getBearerAuth,
		getBasicAuth,
	}

}

function createRes(req: Req): Res {

	let status = 200
	let body: BodyInit | null = null
	const headers = new Headers()
	const cookies = {}
	let handled = false

	function send(b?: BodyInit | null, opt: ResOpt = {}) {
		body = b ?? body
		status = opt.status ?? status
		headers.set("Set-Cookie", buildKV(cookies))
		if (opt.headers) {
			for (const k in opt.headers) {
				headers.set(k, opt.headers[k])
			}
		}
		handled = true
	}

	function sendText(content: string, opt: ResOpt = {}) {
		headers.set("Content-Type", "text/plain; charset=utf-8")
		send(content, opt)
	}

	function sendHTML(content: string, opt: ResOpt = {}) {
		headers.set("Content-Type", "text/html; charset=utf-8")
		send(content, opt)
	}

	function sendJSON(content: unknown, opt: ResOpt = {}) {
		headers.set("Content-Type", "application/json; charset=utf-8")
		send(JSON.stringify(content), opt)
	}

	async function sendFile(p: string, opt: SendFileOpt & ResOpt = {}) {
		const file = Bun.file(p)
		if (!await file.exists()) {
			throw new HTTPError(404, "not found")
		}
		const range = req.headers.get("Range")
		if (range) {
			// TODO: cache
			let [start, end] = range
				.replace("bytes=", "")
				.split("-")
				.map((x) => parseInt(x, 10))
			if (isNaN(start)) start = 0
			if (isNaN(end)) end = file.size - 1
			if (
				start < 0 || start >= file.size ||
				end < 0 || end >= file.size ||
				start > end
			) {
				throw new HTTPError(416, "invalid range")
			}
			headers.set("Content-Range", `bytes ${start}-${end}/${file.size}`)
			headers.set("Content-Length", "" + (end - start + 1))
			headers.set("Accept-Ranges", "bytes")
			return send(file.slice(start, end + 1), {
				...opt,
				status: 206,
			})
		}
		const mtimeServer = req.headers.get("If-Modified-Since")
		const mtimeClient = toHTTPDate(new Date(file.lastModified))
		if (mtimeServer === mtimeClient) {
			return send(null, { status: 304 })
		}
		headers.set("Last-Modified", mtimeClient)
		headers.set("Cache-Control", "no-cache")
		return send(file, opt)
	}

	function redirect(url: string, opt: RedirectOpt & ResOpt = {}) {
		if (opt.permanent) {
			if (opt.switchToGet) {
				status = 301
			} else {
				status = 308
			}
		} else {
			if (opt.switchToGet) {
				status = 303
			} else {
				status = 307
			}
		}
		headers.set("Location", url)
		send(null, opt)
	}

	return {
		get status() { return status },
		set status(s) { status = s },
		get body() { return body },
		set body(b) { body = b },
		get handled() { return handled },
		set handled(b) { handled = b },
		headers,
		cookies,
		send,
		sendText,
		sendHTML,
		sendJSON,
		sendFile,
		redirect,
	}

}

export function createServer(opts: ServerOpts = {}) {

	const handlers: Handler[] = []

	const defErrHandler: ErrorHandler = ({ req, res }, err: Error) => {
		console.error(err)
		if (err instanceof HTTPError) {
			res.status = err.code
			res.sendText(`${err.code} ${err.message}`)
		} else {
			res.status = 500
			res.sendText("500 internal server error")
		}
	}

	let errHandler = defErrHandler

	function use(handler: Handler) {
		handlers.push(handler)
	}

	async function fetch(bunReq: Request) {

		const req = createReq(bunReq, bunServer)
		const res = createRes(req)
		const ctx = { res, req }
		let idx = -1

		async function dispatch(i: number) {
			if (i <= idx) throw new Error("next() called multiple times")
			idx = i
			const fn = handlers[i]
			if (!fn) return
			try {
				await fn(ctx, () => dispatch(i + 1))
			} catch (e) {
				errHandler(ctx, e as Error)
			}
		}

		await dispatch(0)

		if (!res.handled) {
			res.status = 404
			res.body = "404 not found"
		}

		return new Response(res.body, {
			status: res.status,
			headers: res.headers,
		})

	}

	const bunServer = Bun.serve({
		port: opts.port,
		hostname: opts.hostname ?? "::",
		fetch,
		development: isDev,
	})

	return {
		use: use,
		error: (action: ErrorHandler) => errHandler = action,
		url: bunServer.url,
	}

}

export function matchPath(pat: string, url: string): Record<string, string> | null {

	pat = pat.replace(/\/$/, "")
	url = url.replace(/\/$/, "")

	if (pat === url) return {}

	const vars = pat.match(/:[^\/]+/g) || []
	let regStr = pat

	for (const v of vars) {
		const name = v.substring(1)
		regStr = regStr.replace(v, `(?<${name}>[^\/]+)`)
	}

	regStr = "^" + regStr + "$"

	const reg = new RegExp(regStr)
	const matches = reg.exec(url)

	if (matches) {
		return { ...matches.groups }
	} else {
		return null
	}

}

export type HTTPMethod =
	| "GET"
	| "HEAD"
	| "POST"
	| "PUT"
	| "DELETE"
	| "CONNECT"
	| "OPTIONS"
	| "TRACE"
	| "PATCH"

export type Router = {
	add: (method: HTTPMethod | "*", path: string, handler: Handler) => void,
	mount: (prefix?: string) => Handler,
}

type RouteDef = {
	method: HTTPMethod | "*",
	path: string,
	handler: Handler,
}

export function createRouter(): Router {
	const routes: RouteDef[] = []
	function add(method: HTTPMethod | "*", path: string, handler: Handler) {
		routes.push({
			path: path,
			method: method,
			handler: handler,
		})
	}
	function mount(prefix: string = ""): Handler {
		return async (ctx, next) => {
			const { req, res } = ctx
			let method = req.method.toUpperCase()
			if (method === "HEAD") {
				method = "GET"
			}
			for (const route of routes) {
				if (
					route.method !== "*" &&
					route.method.toUpperCase() !== method
				) {
					continue
				}
				const match = matchPath(prefix + route.path, decodeURI(req.url.pathname))
				if (match) {
					ctx.req.params = match
					return await route.handler(ctx, next)
				}
			}
			await next()
		}
	}
	return {
		add,
		mount,
	}
}

export const route = (method: HTTPMethod, path: string, handler: Handler) => {
	const r = createRouter()
	r.add(method, path, handler)
	return r.mount()
}

const trimSlashes = (str: string) => str.replace(/\/*$/, "").replace(/^\/*/, "")

export function files(route = "", root = ""): Handler {
	return async ({ req, res }, next) => {
		route = trimSlashes(route)
		const pathname = trimSlashes(decodeURI(req.url.pathname))
		if (!pathname.startsWith(route)) return await next()
		const baseDir = "./" + trimSlashes(root)
		const relativeURLPath = pathname.replace(new RegExp(`^${route}/?`), "")
		const p = path.join(baseDir, relativeURLPath)
		return await res.sendFile(p)
	}
}

async function isFile(path: string) {
	try {
		const stat = await Bun.file(path).stat()
		return stat.isFile()
	} catch {
		return false
	}
}

async function isDir(path: string) {
	try {
		const stat = await Bun.file(path).stat()
		return stat.isDirectory()
	} catch {
		return false
	}
}

export async function dataurl(path: string) {
	const file = Bun.file(path)
	const base64 = await fs.readFile(path, { encoding: "base64" })
	return `data:${file.type};base64,${base64}`
}

export function filebrowser(route = "", root = ""): Handler {
	route = trimSlashes(route)
	root = trimSlashes(root)
	return async ({ req, res }, next) => {
		const urlPath = trimSlashes(decodeURIComponent(req.url.pathname))
		if (!urlPath.startsWith(route)) return await next()
		const relativeURLPath = urlPath.replace(new RegExp(`^${route}/?`), "")
		const isRoot = relativeURLPath === ""
		const diskPath = path.join("./" + root, relativeURLPath)
		if (await isFile(diskPath)) return await res.sendFile(diskPath)
		if (!await isDir(diskPath)) return await next()
		const entries = (await fs.readdir(diskPath))
			.filter((entry) => !entry.startsWith("."))
			.sort((a, b) => a > b ? -1 : 1)
			.sort((a, b) => path.extname(a) > path.extname(b) ? 1 : -1)
		const files = []
		const dirs = []
		for (const name of entries) {
			const p = path.join(diskPath, name)
			const file = Bun.file(p)
			const stat = await file.stat()
			if (stat.isDirectory()) {
				dirs.push(name)
			} else if (stat.isFile()) {
				const entry = {
					name: name,
					mime: file.type,
				}
				if (name.startsWith("README") || name === "index.html") {
					files.unshift(entry)
				} else {
					files.push(entry)
				}
			}
		}
		async function defFile(p: string) {
			const files = [
				"index.html",
				"README",
			]
			for (const file of files) {
				if (await isFile(path.join(p, file))) {
					return `#${file}`
				}
			}
			return ""
		}
		return res.sendHTML("<!DOCTYPE html>" + h("html", { lang: "en" }, [
			h("head", {}, [
				h("title", {}, urlPath + "/"),
				h("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
				h("style", {}, css({
					"*": {
						"margin": "0",
						"padding": "0",
						"box-sizing": "border-box",
					},
					"html": {
						"width": "100%",
						"height": "100%",
					},
					"body": {
						"width": "100%",
						"height": "100%",
						"padding": "8px",
						"font-size": "16px",
						"font-family": "Monospace",
						"display": "grid",
						"grid-template-columns": "1fr 3fr",
						"gap": "8px",
						"@media": {
							"(max-width: 640px)": {
								"grid-template-columns": "1fr",
								"grid-template-rows": "1fr 2fr",
							},
						},
					},
					"#tree": {
						"border-right": "dotted 2px #ccc",
						"outline": "none",
						"@media": {
							"(max-width: 640px)": {
								"border-bottom": "dotted 2px #ccc"
							},
						},
					},
					".box": {
						"padding": "8px",
						"overflow": "scroll",
						"height": "100%",
					},
					"li": {
						"list-style": "none",
					},
					"a": {
						"color": "blue",
						"text-decoration": "none",
						"cursor": "pointer",
						":hover": {
							"background": "blue",
							"color": "white",
						},
						"&.selected": {
							"background": "blue",
							"color": "white",
						},
					},
					"p": {
						"white-space": "pre-wrap",
						"overflow": "scroll",
						"height": "100%",
					},
					"img": {
						"max-width": "calc(100% - 4px)",
						"max-height": "calc(100% - 4px)",
					},
					"video": {
						"max-width": "calc(100% - 4px)",
						"max-height": "calc(100% - 4px)",
					},
					"iframe": {
						"border": "none",
						"outline": "none",
						"width": "calc(100% - 4px)",
						"height": "calc(100% - 4px)",
					},
					"embed": {
						"border": "none",
						"outline": "none",
						"width": "calc(100% - 4px)",
						"height": "calc(100% - 4px)",
					},
				})),
			]),
			h("body", {}, [
				h("ul", { id: "tree", class: "box", tabindex: 0 }, [
					...(isRoot ? [] : [
						h("a", {
							href: `/${path.dirname(urlPath)}${await defFile(path.dirname(diskPath))}`,
						}, ".."),
					]),
					...await mapAsync(dirs, async (d: string) => h("li", {}, [
						h("a", {
							href: `/${urlPath}/${d}${await defFile(`${diskPath}/${d}`)}`,
						}, d + "/"),
					])),
					...files.map(({ name, mime }) => h("li", {}, [
						h("a", {
							href: `#${name}`,
							class: "entry",
							"data-type": mime,
						}, name),
					])),
				]),
				h("div", { id: "content", class: "box" }, []),
				h("script", {}, `
const entries = document.querySelectorAll(".entry")
const content = document.querySelector("#content")
const tree = document.querySelector("#tree")
let curIdx = null

tree.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    e.preventDefault()
    if (curIdx === null) {
      toIdx(0)
    } else {
      if (e.key === "ArrowUp") {
        if (curIdx > 0) {
          location.hash = "#" + entries[curIdx - 1].textContent
        }
      } else if (e.key === "ArrowDown") {
        if (curIdx < entries.length - 1) {
          location.hash = "#" + entries[curIdx + 1].textContent
        }
      }
    }
  }
})

function isInView(el) {
  const rect = el.getBoundingClientRect()
  return (
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth
  )
}

function reset() {
  for (const entry of entries) {
    entry.classList.remove("selected")
  }
  content.innerHTML = ""
  document.title = "${urlPath}" + "/"
  curIdx = null
}

async function toIdx(i) {

  const entry = entries[i]
  if (!entry) return

  reset()
  curIdx = i
  entry.classList.add("selected")

  if (!isInView(entry)) {
    entry.scrollIntoView()
  }

  const file = entry.textContent
  const url = "/" + "${urlPath}" + "/" + encodeURIComponent(file)

  document.title = "${urlPath}" + "/" + file
  content.innerHTML = ""

  const ty = entry.getAttribute("data-type")

  const fetchContent = async () => {
    const anim = setInterval(() => {
      let c = content.textContent.length
      c = (c + 1) % 4
      content.textContent = ".".repeat(c)
    }, 100)
    const res = await fetch(url)
    content.innerHTML = ""
    clearInterval(anim)
    return res
  }

  if (ty.startsWith("text/html")) {
    const iframe = document.createElement("iframe")
    iframe.src = url
    content.append(iframe)
  } else if (ty.startsWith("text/") || ty.includes("charset=utf-8")) {
    const res = await fetchContent()
    const p = document.createElement("p")
    p.textContent = await res.text()
    content.append(p)
  } else if (ty.startsWith("image/")) {
    const img = document.createElement("img")
    img.src = url
    content.append(img)
  } else if (ty.startsWith("video/")) {
    const video = document.createElement("video")
    video.src = url
    video.controls = true
    content.append(video)
  } else if (ty.startsWith("audio/")) {
    const audio = document.createElement("audio")
    audio.src = url
    audio.controls = true
    content.append(audio)
  } else if (ty.includes("pdf")) {
    const embed = document.createElement("embed")
    embed.src = url
    content.append(embed)
  } else {
    content.textContent = "file type not supported"
  }

}

function findIdx(file) {
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    if (entry.textContent === file) {
      return i
    }
  }
  return -1
}

function getHash() {
  return decodeURIComponent(location.hash.substring(1))
}

function updateHash() {
  const hash = getHash()
  const idx = findIdx(hash)
  if (idx !== -1) {
    toIdx(idx)
  } else {
    reset()
  }
}

window.addEventListener("hashchange", () => {
  updateHash()
})

if (location.hash) {
  updateHash()
}
				`),
			]),
		]))
	}
}

export function toHTTPDate(d: Date) {
	return d.toUTCString()
}

// TODO: is there a way to get bun calculated Content-Length result?
export function getBodySize(body: BodyInit) {
	if (typeof body === "string") {
		return Buffer.byteLength(body)
	} else if (body instanceof Blob) {
		return body.size
	} else if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
		return body.byteLength
	} else if (body instanceof URLSearchParams) {
		return Buffer.byteLength(body.toString())
	} else if (body instanceof FormData) {
		// NOTE: FormData body also has boundary strings, field headers, and line breaks
		let size = 0
		body.forEach((v, k) => {
			if (typeof v === "string") {
				size += Buffer.byteLength(v)
			} else {
				size += v.size
			}
		})
		return size
	}
	return 0
}

export function logger(): Handler {
	return async ({ req, res }, next) => {
		const startTime = new Date()
		await next()
		const endTime = new Date()
		const msg = []
		const year = endTime.getUTCFullYear().toString().padStart(4, "0")
		const month = (endTime.getUTCMonth() + 1).toString().padStart(2, "0")
		const date = endTime.getUTCDate().toString().padStart(2, "0")
		const hour = endTime.getUTCHours().toString().padStart(2, "0")
		const minute = endTime.getUTCMinutes().toString().padStart(2, "0")
		const seconds = endTime.getUTCSeconds().toString().padStart(2, "0")
		// TODO: why this turns dim red for 4xx and 5xx responses?
		msg.push(`${ansi.dim}[${year}-${month}-${date} ${hour}:${minute}:${seconds}]${ansi.reset}`)
		const statusClor = {
			"1": ansi.yellow,
			"2": ansi.green,
			"3": ansi.blue,
			"4": ansi.red,
			"5": ansi.red,
		}[res.status.toString()[0]] ?? ansi.yellow
		msg.push(`${ansi.bold}${statusClor}${res.status}${ansi.reset}`)
		msg.push(req.method)
		msg.push(req.url.pathname)
		msg.push(`${ansi.dim}${endTime.getTime() - startTime.getTime()}ms${ansi.reset}`)
		const size = res.body ? getBodySize(res.body) : 0
		if (size) {
			msg.push(`${ansi.dim}${fmtBytes(size)}${ansi.reset}`)
		}
		console.log(msg.join(" "))
	}
}

export function formToJSON(form: FormData) {
	const json: any = {}
	form.forEach((v, k) => json[k] = v)
	return json
}

export async function getReqJSON<T = any>(req: Request): Promise<T> {
	const ty = req.headers.get("Content-Type")
	if (
		ty?.startsWith("application/x-www-form-urlencoded") ||
		ty?.startsWith("multipart/form-data")
	) {
		const formData = await req.formData()
		return formToJSON(formData)
	} else {
		return await req.json()
	}
}

export function getFormText(form: FormData, key: string): string | null {
	const t = form.get(key)
	if (typeof t === "string") {
		return t
	}
	return null
}

export function getFormBlob(form: FormData, key: string): Blob | null {
	const b = form.get(key)
	if (b && b instanceof Blob && b.size > 0) {
		return b
	}
	return null
}

export async function getFormBlobData(form: FormData, key: string) {
	const b = getFormBlob(form, key)
	if (b) {
		return new Uint8Array(await b.arrayBuffer())
	}
}
