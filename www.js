// helpers for the world wide web with Bun

function createServer() {

	const handlers = []

	let handleError = (e) => {
		console.error(e)
		return new Response("Internal server error", {
			status: 500,
		})
	}

	let handleNotFound = () => {
		return new Response("404", {
			status: 404,
		})
	}

	function handleMatch(req, pat, handler) {
		const url = new URL(req.url)
		const match = matchUrl(pat, url.pathname)
		if (match) return handler(req, match)
	}

	function genMethodHandler(method) {
		return (pat, handler) => {
			handlers.push((req) => {
				if (req.method !== method) return
				return handleMatch(req, pat, handler)
			})
		}
	}

	function handle(handler) {
		handlers.push(handler)
	}

	async function fetch(req) {
		// TODO: better async?
		for (const handle of handlers) {
			try {
				const res = handle(req)
				if (res instanceof Promise) {
					const awaitedRes = await res
					if (awaitedRes) return awaitedRes
				} else {
					if (res) return res
				}
			} catch (e) {
				return handleError(req, e)
			}
		}
		return handleNotFound(req)
	}

	return {
		handle: handle,
		error: (action) => handleError = action,
		notFound: (action) => handleNotFound = action,
		files: (route, root) => {
			handle((req) => {
				const url = new URL(req.url)
				route = route.replace(/\/*$/, "")
				if (!url.pathname.startsWith(route)) return
				const path = "./" + root + url.pathname.replace(new RegExp(`^${route}`), "")
				const file = Bun.file(path)
				if (file.size === 0) return
				return new Response(file)
			})
		},
		match: (pat, cb) => handle((req) => handleMatch(req, pat, handler)),
		get: genMethodHandler("GET"),
		post: genMethodHandler("POST"),
		put: genMethodHandler("PUT"),
		del: genMethodHandler("DEL"),
		start: (port, hostname) => {
			return Bun.serve({
				port: port,
				hostname: hostname,
				fetch: fetch,
			})
		},
		fetch: fetch,
	}
}

function matchUrl(pat, url) {

	pat = pat.replace(/\/$/, "")
	url = url.replace(/\/$/, "")

	if (pat === url) {
		return {}
	}

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

function redirect(link, status = 307) {
	return new Response(null, {
		status: status,
		headers: {
			"Location": link,
		},
	})
}

function html(content) {
	return new Response(content, {
		headers: {
			"Content-Type": "text/html; charset=utf-8",
		},
	})
}

const nl = process.env.NODE_ENV === "production" ? "" : "\n"

// html text builder
function h(tagname, attrs, children) {

	let html = `<${tagname}`

	for (const k in attrs) {
		let v = attrs[k]
		switch (typeof(v)) {
			case "boolean":
				if (v === true) {
					html += ` ${k}`
				}
				break
			case "string":
				if (typeof(v) === "string") {
					v = `"${v}"`
				}
			case "number":
				html += ` ${k}=${v}`
				break
		}
	}

	html += ">"

	if (typeof(children) === "string" || typeof(children) === "number") {
		html += children
	} else if (Array.isArray(children)) {
		for (const child of children) {
			if (!child) {
				continue
			}
			if (Array.isArray(child)) {
				html += h("div", {}, child)
			} else {
				html += child
			}
		}
	}

	if (children !== undefined && children !== null) {
		html += `</${tagname}>` + nl
	}

	return html

}

const camelToKababCase = (str) =>
	str.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

// TODO: @font-face
// sass-like css preprocessor
function style(list) {

	let text = ""

	function handleSheet(s) {
		let t = "{" + nl
		for (const k in s) {
			t += camelToKababCase(k) + ":" + s[k] + ";" + nl
		}
		t += "}" + nl
		return t
	}

	function handleSheetEx(sel, sheet) {
		let t = sel + " {" + nl
		let post = ""
		for (const key in sheet) {
			const val = sheet[key]
			// media
			if (key === "@media") {
				for (const cond in val) {
					post += "@media " + cond + "{" + nl + sel + handleSheet(val[cond]) + "}" + nl
				}
			// pseudo class
			} else if (key[0] === ":") {
				post += handleSheetEx(sel + key, val)
			// self
			} else if (key[0] === "&") {
				post += handleSheetEx(sel + key.substring(1), val)
			// nesting child
			} else if (typeof(val) === "object") {
				post += handleSheetEx(sel + " " + key, val)
			} else {
				t += camelToKababCase(key) + ":" + val + ";" + nl
			}
		}
		t += "}" + nl + post
		return t
	}

	for (const sel in list) {
		const sheet = list[sel]
		if (sel === "@keyframes") {
			for (const name in sheet) {
				const map = sheet[name]
				text += "@keyframes " + name + "{" + nl
				for (const time in map) {
					text += time + handleSheet(map[time])
				}
				text += "}" + nl
			}
		} else {
			text += handleSheetEx(sel, sheet)
		}
	}

	return text

}

function escapeHTML(unsafe) {
	return unsafe
		.replace(/&/g, "&amp")
		.replace(/</g, "&lt")
		.replace(/>/g, "&gt")
		.replace(/"/g, "&quot")
		.replace(/'/g, "&#039")
}


// TODO: a way to only generate used classes, record in h()?
// TODO: deal with pseudos like :hover
// tailwind-like css helpers
const csslibBase = {
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
	csslibBase[`.grow-${i}}`] = { "flex-grow": i }
	csslibBase[`.shrink-${i}}`] = { "flex-shrink": i }
	csslibBase[`.flex-${i}}`] = { "flex-grow": i, "flex-shrink": i }
}

for (let i = 4; i <= 128; i += 4) {
	csslibBase[`.g${i}`] = { "gap": `${i}px` }
	csslibBase[`.p${i}`] = { "padding": `${i}px` }
	csslibBase[`.px${i}`] = { "padding-x": `${i}px` }
	csslibBase[`.py${i}`] = { "padding-y": `${i}px` }
	csslibBase[`.m${i}`] = { "margin": `${i}px` }
	csslibBase[`.mx${i}`] = { "margin-x": `${i}px` }
	csslibBase[`.my${i}`] = { "margin-y": `${i}px` }
	csslibBase[`.f${i}`] = { "font-size": `${i}px` }
	csslibBase[`.r${i}`] = { "border-radius": `${i}px` }
}

const breakpoints = {
	"sm": 640,
	"md": 768,
	"lg": 1024,
	"xl": 1280,
}

const pseudos = [
	"hover",
	"active",
	"focus",
]

function compileStyles(sheet) {
	let css = ""
	for (const sel in sheet) {
		const styles = sheet[sel]
		css += `${sel} {` + nl
		for (const style in styles) {
			css += `${style}: ${styles[style]};` + nl
		}
		css += `}` + nl
	}
	return css
}

function mapKeys(obj, mapFn) {
	return Object.keys(obj).reduce((result, key) => {
		result[mapFn(key)] = obj[key]
		return result
	}, {})
}

let csslib = compileStyles(csslibBase)

for (const bp in breakpoints) {
	csslib += `@media (min-width: ${breakpoints[bp]}px) {` + nl
	csslib += compileStyles(mapKeys(csslibBase, (sel) => `.${bp}:${sel.substring(1)}`))
	csslib += `}` + nl
}

export {
	h,
	style,
	createServer,
	escapeHTML,
	csslib,
	html,
	redirect,
}
