import * as path from "node:path"

const isPromise = (input: any): input is Promise<any> => {
	return input
		&& typeof input.then === "function"
		&& typeof input.catch === "function"
}

export type Req = {
	method: string,
	headers: Headers,
	url: URL,
	params: Record<string, string>,
	text: () => Promise<string>,
	arrayBuffer: () => Promise<ArrayBuffer>,
	json<T = any>(): Promise<T>,
	formData: () => Promise<FormData>,
	blob: () => Promise<Blob>,
	getIP: () => string | null,
	getCookies: () => Record<string, string>,
}

type ResBase = {
	headers: Headers,
	status: number,
	body: null | BodyInit,
	send: (data?: BodyInit | null, opt?: ResOpt) => void,
	sendText: (content: string, opt?: ResOpt) => void,
	sendHTML: (content: string, opt?: ResOpt) => void,
	sendJSON: <T = any>(content: T, opt?: ResOpt) => void,
	redirect: (url: string, status?: number) => void,
}

type ResWithFS = ResBase & {
	sendFile: (
		path: string,
		opt?: ResOpt & { mimes?: Record<string, string> }
	) => Promise<void>,
}

export type Res<Env> =
	(Env extends HasStaticContent ? ResWithFS : ResBase)

export type ResOpt = {
	headers?: HeadersInit,
	status?: number,
}

export type KVValFormat =
	| "arrayBuffer"
	| "text"
	| "json"
	| "stream"

type FS = {
	readFile(path: string, format?: "text"): Promise<string | null>,
	readFile(path: string, format: "arrayBuffer"): Promise<ArrayBuffer | null>,
	readFile<V = unknown>(path: string, format: "json"): Promise<V | null>,
	readFile(path: string, format: "stream"): Promise<ReadableStream | null>,
	readDir(path: string): string[],
	guessMime(path: string, mimes?: Record<string, string>): string | null,
	listFiles(): string[],
	isFile(path: string): boolean,
	isDir(path: string): boolean,
	exists(path: string): boolean,
}

type Dir = { [p: string]: Dir | string }

function createFS(kv: KVNamespace, manifest: Record<string, string>) {

	const tree: Dir = {}

	for (const p in manifest) {
		const chunks = p.split("/")
		let curDir = tree
		chunks.forEach((chunk, i) => {
			if (i === chunks.length - 1) {
				curDir[chunk] = manifest[p]
			} else {
				if (!curDir[chunk]) {
					curDir[chunk] = {}
				}
				curDir = curDir[chunk] as Dir
			}
		})
	}

	const readFile = async (path: string, format: KVValFormat = "text") => {
		if (!manifest[path]) {
			throw new Error(`Not in asset manifest: ${path}`)
		}
		return await kv.get(manifest[path], {
			// @ts-ignore
			type: format,
		})
	}

	const readDir = (path: string) => {
		let curDir = tree
		for (const c of path.split("/")) {
			if (typeof curDir[c] !== "object") {
				return []
			}
			curDir = curDir[c] as Dir
		}
		return Object.keys(curDir)
	}

	const listFiles = () => Object.keys(manifest)
	const isFile = (path: string) => Boolean(manifest[path])

	const isDir = (path: string) => {
		let curDir = tree
		for (const c of path.split("/")) {
			if (typeof curDir[c] !== "object") {
				return false
			}
			curDir = curDir[c] as Dir
		}
		return true
	}

	const exists = (p: string) => isFile(p) || isDir(p)

	const guessMime = (p: string, moreMimes: Record<string, string> = {}) => {
		let mime = { ...mimes, ...moreMimes }[path.extname(p).substring(1)]
		if (!mime) return null
		if (mime.startsWith("text") || mime === "application/json") {
			mime += "; charset=utf-8"
		}
		return mime
	}

	return {
		readFile: readFile as FS["readFile"],
		readDir,
		isFile,
		isDir,
		exists,
		listFiles,
		guessMime,
	}

}

type CtxBase<Env = unknown> = {
	req: Req,
	res: Res<Env>,
	env: Env,
	next: () => void,
	onFinish: (action: () => void) => void,
	onError: (action: (e: Error) => void) => void,
}

type CtxWithFS<Env = unknown> = CtxBase<Env> & { fs: FS }

type HasStaticContent = { __STATIC_CONTENT: KVNamespace }

export type Ctx<Env> =
	(Env extends HasStaticContent ? CtxWithFS<Env> : CtxBase<Env>)

export type Handler<Env> = (ctx: Ctx<Env>) => void
export type ErrorHandler<Env> = (ctx: Ctx<Env>, err: Error) => void
export type NotFoundHandler<Env> = (ctx: Ctx<Env>) => void

export type Server<Env> = {
	use: (handler: Handler<Env>) => void,
	error: (handler: ErrorHandler<Env>) => void,
	notFound: (action: NotFoundHandler<Env>) => void,
	fetch: ExportedHandlerFetchHandler<Env>,
}

const mimes: Record<string, string> = {
	"gif":   "image/gif",
	"jpg":   "image/jpeg",
	"jpeg":  "image/jpeg",
	"png":   "image/png",
	"ico":   "image/ico",
	"svg":   "image/svg+xml",
	"webp":  "image/webp",
	"mp3":   "audio/mpeg",
	"aac":   "audio/aac",
	"wav":   "audio/wav",
	"ogg":   "audio/ogg",
	"mid":   "audio/midi",
	"midi":  "audio/midi",
	"mp4":   "video/mp4",
	"mpeg":  "video/mpeg",
	"webm":  "video/webm",
	"mov":   "video/quicktime",
	"htm":   "text/html",
	"html":  "text/html",
	"js":    "text/javascript",
	"txt":   "text/plain",
	"css":   "text/css",
	"csv":   "text/csv",
	"otf":   "font/otf",
	"ttf":   "font/ttf",
	"woff":  "font/woff",
	"woff2": "font/woff2",
	"xml":   "application/xml",
	"zip":   "application/zip",
	"pdf":   "application/pdf",
	"json":  "application/json",
	"map":   "application/json",
	"rtf":   "application/rtf",
	"bin":   "application/octet-stream",
	"gltf":  "model/gltf+json",
	"glb":   "model/gltf-binary",
	"obj":   "model/obj",
	"mtl":   "model/mtl",
	"stl":   "model/stl",
}

function headersToJSON(h: Headers) {
	const json: Record<string, string> = {}
	h.forEach((v, k) => json[k] = v)
	return json
}

export async function createServer<Env extends object = {}>(): Promise<Server<Env>> {

	let assetManifest = null

	try {
		// @ts-ignore
		const assetManifestMod = await import("__STATIC_CONTENT_MANIFEST")
		if (assetManifestMod) {
			assetManifest = JSON.parse(assetManifestMod.default)
		}
	} catch {}

	const fetch: ExportedHandlerFetchHandler<Env> = async (cfReq, env) => {

		return new Promise((resolve) => {

			let done = false

			const req: Req = {
				method: cfReq.method,
				url: new URL(cfReq.url),
				headers: cfReq.headers,
				params: {},
				text: cfReq.text.bind(cfReq),
				json: cfReq.json.bind(cfReq),
				arrayBuffer: cfReq.arrayBuffer.bind(cfReq),
				formData: cfReq.formData.bind(cfReq),
				blob: cfReq.blob.bind(cfReq),
				getIP: () => {
					return cfReq.headers.get("CF-Connecting-IP")
				},
				getCookies: () => {
					const str = cfReq.headers.get("Cookie")
					if (!str) return {}
					const cookies: Record<string, string> = {}
					for (const c of str.split(";")) {
						const [k, v] = c.split("=")
						cookies[k.trim()] = v.trim()
					}
					return cookies
				},
			}

			const onFinishEvents: Array<() => void> = []
			const onErrorEvents: Array<(e: Error) => void> = []
			let fs: FS | undefined

			if ("__STATIC_CONTENT" in env && assetManifest) {
				fs = createFS(env.__STATIC_CONTENT as KVNamespace, assetManifest)
			}

			function finish(res: Response) {
				if (done) return
				resolve(res)
				done = true
				onFinishEvents.forEach((f) => f())
			}

			// @ts-ignore
			const res: Res<Env> = {
				headers: new Headers(),
				status: 200,
				body: null,
				send(body, opt = {}) {
					if (done) return
					this.body = body ?? null
					finish(new Response(body, {
						headers: {
							...headersToJSON(this.headers),
							...(opt.headers ?? {}),
						},
						status: opt.status ?? this.status,
					}))
				},
				sendText(content, opt) {
					this.headers.append("Content-Type", "text/plain; charset=utf-8")
					this.send(content, opt)
				},
				sendHTML(content, opt) {
					this.headers.append("Content-Type", "text/html; charset=utf-8")
					this.send(content, opt)
				},
				sendJSON(content, opt) {
					this.headers.append("Content-Type", "application/json; charset=utf-8")
					this.send(JSON.stringify(content), opt)
				},
				async sendFile(p, opt) {
					if (!fs) {
						throw new Error("No fs")
					}
					const data = await fs.readFile(p, "arrayBuffer")
					if (data === null) {
						return next()
					}
					const mime = fs.guessMime(p, opt?.mimes)
					if (mime) {
						this.headers.append("Content-Type", mime)
					}
					this.send(data, opt)
				},
				redirect(url: string, status: number = 302) {
					finish(Response.redirect(url, status))
				},
			}

			const curHandlers = [...handlers]

			function next() {
				if (done) return
				const h = curHandlers.shift()
				// @ts-ignore
				const ctx: Ctx<Env> = {
					req,
					res,
					next,
					env,
					fs,
					onFinish(action) {
						onFinishEvents.push(action)
					},
					onError(action) {
						onErrorEvents.push(action)
					},
				}

				if (h) {
					try {
						const res = h(ctx)
						if (isPromise(res)) {
							res.catch((e) => {
								if (errHandler) {
									errHandler(ctx, e)
									onErrorEvents.forEach((f) => f(e))
								}
							})
						}
					} catch (e) {
						errHandler(ctx, e as Error)
						onErrorEvents.forEach((f) => f(e as Error))
					}
				} else {
					notFoundHandler(ctx)
				}

			}

			next()

		})

	}

	const handlers: Handler<Env>[] = []
	const use = (handler: Handler<Env>) => handlers.push(handler)
	let errHandler: ErrorHandler<Env> = ({ req, res, next }, err) => {
		console.error(err)
		res.status = 500
		res.sendText(`internal server error`)
	}
	let notFoundHandler: NotFoundHandler<Env> = ({ res }) => {
		res.status = 404
		res.sendText("not found")
	}

	return {
		fetch: fetch,
		use: use,
		error: (action: ErrorHandler<Env>) => errHandler = action,
		notFound: (action: NotFoundHandler<Env>) => notFoundHandler = action,
	}
}

type Func = (...args: any[]) => any

function overload2<A extends Func, B extends Func>(fn1: A, fn2: B): A & B {
	return ((...args) => {
		const al = args.length
		if (al === fn1.length) return fn1(...args)
		if (al === fn2.length) return fn2(...args)
	}) as A & B
}

function overload3<
	A extends Func,
	B extends Func,
	C extends Func,
>(fn1: A, fn2: B, fn3: C): A & B & C {
	return ((...args) => {
		const al = args.length
		if (al === fn1.length) return fn1(...args)
		if (al === fn2.length) return fn2(...args)
		if (al === fn3.length) return fn3(...args)
	}) as A & B & C
}

function overload4<
	A extends Func,
	B extends Func,
	C extends Func,
	D extends Func,
>(fn1: A, fn2: B, fn3: C, fn4: D): A & B & C & D {
	return ((...args) => {
		const al = args.length
		if (al === fn1.length) return fn1(...args)
		if (al === fn2.length) return fn2(...args)
		if (al === fn3.length) return fn3(...args)
		if (al === fn4.length) return fn4(...args)
	}) as A & B & C & D
}

const trimSlashes = (str: string) => str.replace(/\/*$/, "").replace(/^\/*/, "")
const parentPath = (p: string, sep = "/") => p.split(sep).slice(0, -1).join(sep)

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

export const route = overload2(<Env>(pat: string, handler: Handler<Env>): Handler<Env> => {
	return (ctx) => {
		const match = matchPath(pat, decodeURI(ctx.req.url.pathname))
		if (match) {
			ctx.req.params = match
			return handler(ctx)
		} else {
			ctx.next()
		}
	}
}, <Env>(method: string, pat: string, handler: Handler<Env>): Handler<Env> => {
	return (ctx) => {
		if (ctx.req.method.toLowerCase() === method.toLowerCase()) {
			return route(pat, handler)(ctx)
		} else {
			ctx.next()
		}
	}
})

export function files<Env extends HasStaticContent>(route = "", root = ""): Handler<Env> {
	return ({ req, res, next }) => {
		route = trimSlashes(route)
		const pathname = trimSlashes(decodeURI(req.url.pathname))
		if (!pathname.startsWith(route)) return next()
		const baseDir = trimSlashes(root)
		const relativeURLPath = pathname.replace(new RegExp(`^${route}/?`), "")
		const p = path.join(baseDir, relativeURLPath)
		return res.sendFile(p)
	}
}

export function dir<Env extends HasStaticContent>(route = "", root = ""): Handler<Env> {
	return ({ req, res, fs, next }) => {
		route = trimSlashes(route)
		const pathname = trimSlashes(decodeURI(req.url.pathname))
		if (!pathname.startsWith(route)) return next()
		const baseDir = "./" + trimSlashes(root)
		const relativeURLPath = pathname.replace(new RegExp(`^${route}/?`), "")
		const p = path.join(baseDir, relativeURLPath)
		if (fs.isFile(p)) {
			return res.sendFile(p)
		} else if (fs.isDir(p)) {
			const entries = fs.readDir(p)
				.filter((entry) => !entry.startsWith("."))
				.sort((a, b) => a > b ? -1 : 1)
				.sort((a, b) => path.extname(a) > path.extname(b) ? 1 : -1)
			const files = []
			const dirs = []
			for (const entry of entries) {
				const pp = path.join(p, entry)
				if (fs.isDir(pp)) {
					dirs.push(entry)
				} else if (fs.isFile(pp)) {
					files.push(entry)
				}
			}
			const isRoot = relativeURLPath === ""
			return res.sendHTML("<!DOCTYPE html>" + h("html", { lang: "en" }, [
				h("head", {}, [
					h("title", {}, decodeURI(req.url.pathname)),
					h("style", {}, css({
						"*": {
							"margin": "0",
							"padding": "0",
							"box-sizing": "border-box",
						},
						"body": {
							"padding": "16px",
							"font-size": "16px",
							"font-family": "Monospace",
						},
						"li": {
							"list-style": "none",
						},
						"a": {
							"color": "blue",
							"text-decoration": "none",
							":hover": {
								"background": "blue",
								"color": "white",
							},
						},
					})),
				]),
				h("body", {}, [
					h("ul", {}, [
						...(isRoot ? [] : [
							h("a", { href: `/${parentPath(pathname)}`, }, ".."),
						]),
						...dirs.map((dir) => h("li", {}, [
							h("a", { href: `/${pathname}/${dir}`, }, dir + "/"),
						])),
						...files.map((file) => h("li", {}, [
							h("a", { href: `/${pathname}/${file}`, }, file),
						])),
					]),
				]),
			]))
		}
	}
}

export type RateLimiterOpts<Env> = {
	time: number,
	limit: number,
	handler: Handler<Env>,
}

export function rateLimiter<Env>(opts: RateLimiterOpts<Env>): Handler<Env> {
	const reqCounter: Record<string, number> = {}
	return (ctx) => {
		const ip = ctx.req.getIP()
		if (!ip) return ctx.next()
		if (!(ip in reqCounter)) {
			reqCounter[ip] = 0
		}
		reqCounter[ip] += 1
		setTimeout(() => {
			reqCounter[ip] -= 1
			if (reqCounter[ip] === 0) {
				delete reqCounter[ip]
			}
		}, opts.time * 1000)
		if (reqCounter[ip] > opts.limit) {
			ctx.res.status = 429
			return opts.handler(ctx)
		}
		return ctx.next()
	}
}

export type HTMLChild = string | number | undefined | null
export type HTMLChildren = HTMLChild | HTMLChild[]

function escapeHTML(input: string): string {
	const str = String(input)
	let out = "";
	for (let i = 0; i < str.length; i++) {
		const ch = str[i]
		switch (ch) {
			case '"': out += '&quot;'; break
			case "'": out += '&#x27;'; break
			case '&': out += '&amp;'; break
			case '<': out += '&lt;'; break
			case '>': out += '&gt;'; break
			default: out += ch
		}
	}
	return out;
}

// html text builder
export function h(
	tag: string,
	attrs: Record<string, any>,
	children?: HTMLChildren
) {

	let html = `<${tag}`

	for (const k in attrs) {
		let v = attrs[k]
		switch (typeof v) {
			case "boolean":
				if (v === true) {
					html += ` ${k}`
				}
				break
			case "string":
				html += ` ${k}="${escapeHTML(v)}"`
				break
			case "number":
				html += ` ${k}=${v}`
				break
			case "object":
				const value = Array.isArray(v) ? v.join(" ") : style(v)
				html += ` ${k}="${escapeHTML(value)}"`
				break
		}
	}

	html += ">"

	if (typeof(children) === "string" || typeof(children) === "number") {
		html += children
	} else if (Array.isArray(children)) {
		for (const child of children) {
			if (!child) continue
			if (Array.isArray(child)) {
				html += h("div", {}, child)
			} else {
				html += child
			}
		}
	}

	if (children !== undefined && children !== null) {
		html += `</${tag}>`
	}

	return html

}

export function style(sheet: StyleSheet) {
	let style = ""
	for (const prop in sheet) {
		style += `${prop}: ${sheet[prop]};`
	}
	return style
}

export type StyleSheet = Record<string, string | number>

type StyleSheetRecursive = {
	[name: string]: string | number | StyleSheetRecursive,
}

// TODO: fix
// https://www.typescriptlang.org/docs/handbook/2/objects.html#index-signatures
export type CSS = {
	[name: string]: StyleSheetRecursive,
} & {
	"@keyframes"?: {
		[name: string]: Record<string, StyleSheet>,
	},
} & {
	"@font-face"?: StyleSheet[],
}

export type CSSOpts = {
	readable?: boolean,
}

// sass-like css preprocessor
export function css(list: CSS, opts: CSSOpts = {}) {

	const nl = opts.readable ? "\n" : ""
	const sp = opts.readable ? " " : ""
	let lv = 0
	const id = () => opts.readable ? " ".repeat(lv * 2) : ""

	function handleSheet(sheet: StyleSheet) {
		let code = "{" + nl
		lv++
		for (const prop in sheet) {
			code += id() + `${prop}:${sp}${sheet[prop]};${nl}`
		}
		lv--
		code += id() + "}" + nl
		return code
	}

	function handleSheetRecursive(sel: string, sheet: StyleSheetRecursive) {
		let code = id() + sel + sp + "{" + nl
		lv++
		let post = ""
		for (const key in sheet) {
			// media
			if (key === "@media") {
				const val = sheet[key] as Record<string, StyleSheet>
				for (const cond in val) {
					post += "@media " + cond + sp + "{" + nl
					post += id() + sel + sp + handleSheet(val[cond])
					post += "}" + nl
				}
			// pseudo class
			} else if (key[0] === ":") {
				lv--
				post += handleSheetRecursive(sel + key, sheet[key] as StyleSheetRecursive)
				lv++
			// self
			} else if (key[0] === "&") {
				lv--
				post += handleSheetRecursive(sel + key.substring(1), sheet[key] as StyleSheetRecursive)
				lv++
			// nesting child
			} else if (typeof sheet[key] === "object") {
				lv--
				post += handleSheetRecursive(sel + " " + key, sheet[key] as StyleSheetRecursive)
				lv++
			} else if (typeof sheet[key] === "string" || typeof sheet[key] === "number") {
				code += id() + `${key}:${sp}${sheet[key]};${nl}`
			}
		}
		lv--
		code += id() + "}" + nl + post
		return code
	}

	let code = ""

	// deal with @keyframes
	for (const sel in list) {
		if (sel === "@keyframes") {
			const sheet = list[sel] as CSS["@keyframes"] ?? {}
			for (const name in sheet) {
				const map = sheet[name]
				code += `@keyframes ${name} {` + nl
				lv++
				for (const time in map) {
					code += id() + time + " " + handleSheet(map[time])
				}
				lv--
				code += "}" + nl
			}
		} else if (sel === "@font-face") {
			const fonts = list[sel] as CSS["@font-face"] ?? []
			for (const font of fonts) {
				code += "@font-face " + handleSheet(font)
			}
		} else {
			code += handleSheetRecursive(sel, list[sel] as StyleSheetRecursive)
		}
	}

	return code

}

function mapKeys<D>(obj: Record<string, D>, mapFn: (k: string) => string) {
	return Object.keys(obj).reduce((result: Record<string, D>, key) => {
		result[mapFn(key)] = obj[key]
		return result
	}, {})
}

export type CSSLibOpts = {
	breakpoints?: Record<string, number>,
}

// TODO: a way to only generate used classes, record in h()?
// TODO: deal with pseudos like :hover
export function csslib(opt: CSSLibOpts = {}) {

	// tailwind-like css helpers
	const base: Record<string, Record<string, string | number>> = {
		".vstack": { "display": "flex", "flex-direction": "column" },
		".hstack": { "display": "flex", "flex-direction": "row" },
		".vstack-reverse": { "display": "flex", "flex-direction": "column-reverse" },
		".hstack-reverse": { "display": "flex", "flex-direction": "row-reverse" },
		".stretch-x": { "width": "100%" },
		".stretch-y": { "height": "100%" },
		".bold": { "font-weight": "bold" },
		".italic": { "font-style": "italic" },
		".underline": { "font-decoration": "underline" },
		".center": { "align-items": "center", "justify-content": "center" },
		".align-start": { "align-items": "flex-start" },
		".align-end": { "align-items": "flex-end" },
		".align-center": { "align-items": "center" },
		".align-stretch": { "align-items": "stretch" },
		".align-baseline": { "align-items": "baseline" },
		".justify-start": { "justify-content": "flex-start" },
		".justify-end": { "justify-content": "flex-end" },
		".justify-center": { "justify-content": "center" },
		".justify-between": { "justify-content": "space-between" },
		".justify-around": { "justify-content": "space-around" },
		".justify-evenly": { "justify-content": "space-evenly" },
		".align-self-start": { "align-items": "flex-start" },
		".align-self-end": { "align-self": "flex-end" },
		".align-self-center": { "align-self": "center" },
		".align-self-stretch": { "align-self": "stretch" },
		".align-self-baseline": { "align-self": "baseline" },
		".text-center": { "text-align": "center" },
		".text-left": { "text-align": "left" },
		".text-right": { "text-align": "right" },
		".wrap": { "flex-wrap": "wrap" },
		".wrap-reverse": { "flex-wrap": "wrap-reverse" },
		".nowrap": { "flex-wrap": "no-wrap" },
	}

	for (let i = 1; i <= 8; i++) {
		base[`.grow-${i}`] = { "flex-grow": i }
		base[`.shrink-${i}`] = { "flex-shrink": i }
		base[`.flex-${i}`] = { "flex-grow": i, "flex-shrink": i }
	}

	const spaces = [2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96, 128]

	for (const s of spaces) {
		base[`.g${s}`] = { "gap": `${s}px` }
		base[`.p${s}`] = { "padding": `${s}px` }
		base[`.px${s}`] = { "padding-left": `${s}px`, "padding-right": `${s}px` }
		base[`.py${s}`] = { "padding-top": `${s}px`, "padding-bottom": `${s}px` }
		base[`.m${s}`] = { "margin": `${s}px` }
		base[`.mx${s}`] = { "margin-left": `${s}px`, "margin-right": `${s}px` }
		base[`.my${s}`] = { "margin-top": `${s}px`, "margin-bottom": `${s}px` }
		base[`.f${s}`] = { "font-size": `${s}px` }
		base[`.r${s}`] = { "border-radius": `${s}px` }
	}

	const compileStyles = (sheet: Record<string, StyleSheet>) => {
		let css = ""
		for (const sel in sheet) {
			css += `${sel} { ${style(sheet[sel])} } `
		}
		return css
	}

	let css = compileStyles(base)
	const breakpoints = opt.breakpoints ?? {}

	for (const bp in breakpoints) {
		css += `@media (max-width: ${breakpoints[bp]}px) {`
		css += compileStyles(mapKeys(base, (sel) => `.${bp}:${sel.substring(1)}`))
		css += `}`
	}

	return css

}
