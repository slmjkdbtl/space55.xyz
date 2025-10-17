import * as fs from "node:fs/promises"

import {
	isDev,
	mapKeys,
} from "./utils"

export type HTMLChild = string | number | undefined | null
export type HTMLChildren = HTMLChild | HTMLChild[]

export type HTMLAttr =
	| boolean
	| string
	| number
	| Array<string | undefined>
	| Record<string, string>

// html text builder
export function h(
	tag: string,
	attrs: Record<string, HTMLAttr>,
	children?: HTMLChildren
) {

	let html = `<${tag}`
	const nl = Array.isArray(children) ? "\n" : ""

	for (const k in attrs) {
		let v = attrs[k]
		switch (typeof v) {
			case "boolean":
				if (v === true) {
					html += ` ${k}`
				}
				break
			case "string":
				html += ` ${k}="${Bun.escapeHTML(v)}"`
				break
			case "number":
				html += ` ${k}=${v}`
				break
			case "object":
				const value = Array.isArray(v) ? v.filter((p) => p).join(" ") : style(v)
				html += ` ${k}="${Bun.escapeHTML(value)}"`
				break
		}
	}

	html += ">" + nl

	if (Array.isArray(children)) {
		for (const child of children) {
			if (!child) continue
			if (Array.isArray(child)) {
				html += h("div", {}, child) + "\n"
			} else {
				html += child + "\n"
			}
		}
	} else if (children) {
		html += children
	}

	if (children !== undefined && children !== null) {
		html += `</${tag}>`
	}

	return html

}

// TODO: better error handling?
export async function js(p: string) {
	const file = Bun.file(p)
	if (file.size === 0) return ""
	const res = await Bun.build({
		entrypoints: [p],
		sourcemap: isDev ? "inline" : "none",
		target: "browser",
	})
	if (res.success) {
		if (res.outputs.length !== 1) {
			throw new Error(`expected 1 output, found ${res.outputs.length}`)
		}
		return await res.outputs[0].text()
	} else {
		console.log(res.logs[0])
		throw new Error("failed to build js")
	}
}

export function jsData(name: string, data: any) {
	const json = JSON.stringify(data)
		.replaceAll("\\", "\\\\")
		.replaceAll("'", "\\'")
	return `window.${name} = JSON.parse('${json}')`
}

export function classes(list: Array<string | Record<string, boolean>>) {
	const c = []
	for (const l of list) {
		if (typeof l === "string") {
			c.push(l)
		} else if (typeof l === "object") {
			for (const k in l) {
				if (l[k]) {
					c.push(k)
				}
			}
		}
	}
	return c
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
	minify?: boolean,
}

// sass-like css preprocessor
export function css(list: CSS, opts: CSSOpts = {}) {

	const nl = opts.minify ? "" : "\n"
	const sp = opts.minify ? "" : " "
	let lv = 0
	const id = () => opts.minify ? "" : " ".repeat(lv * 2)

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

export const c: Record<string, StyleSheet> = {
	"flex": { "display": "flex" },
	"grid": { "display": "grid" },
	"hidden": { "display": "none" },
	"inline": { "display": "inline" },
	"inline-block": { "display": "inline-block" },
	"relative": { "position": "relative" },
	"absolute": { "position": "absolute" },
	"fixed": { "position": "fixed" },
	"container": { "container-type": "inline-size" },
	"vstack": { "display": "flex", "flex-direction": "column" },
	"hstack": { "display": "flex", "flex-direction": "row" },
	"vstack-reverse": { "display": "flex", "flex-direction": "column-reverse" },
	"hstack-reverse": { "display": "flex", "flex-direction": "row-reverse" },
	"fill": { "width": "100%", "height": "100%" },
	"fill-x": { "width": "100%" },
	"fill-y": { "height": "100%" },
	"bold": { "font-weight": "bold" },
	"italic": { "font-style": "italic" },
	"underline": { "font-decoration": "underline" },
	"center": { "align-items": "center", "justify-content": "center" },
	"align-start": { "align-items": "flex-start" },
	"align-end": { "align-items": "flex-end" },
	"align-center": { "align-items": "center" },
	"align-stretch": { "align-items": "stretch" },
	"align-baseline": { "align-items": "baseline" },
	"justify-start": { "justify-content": "flex-start" },
	"justify-end": { "justify-content": "flex-end" },
	"justify-center": { "justify-content": "center" },
	"justify-between": { "justify-content": "space-between" },
	"justify-around": { "justify-content": "space-around" },
	"justify-evenly": { "justify-content": "space-evenly" },
	"align-self-start": { "align-self": "start" },
	"align-self-end": { "align-self": "end" },
	"align-self-center": { "align-self": "center" },
	"align-self-stretch": { "align-self": "stretch" },
	"align-self-baseline": { "align-self": "baseline" },
	"justify-self-start": { "justify-self": "start" },
	"justify-self-end": { "justify-self": "end" },
	"justify-self-center": { "justify-self": "center" },
	"justify-self-stretch": { "justify-self": "stretch" },
	"text-center": { "text-align": "center" },
	"text-left": { "text-align": "left" },
	"text-right": { "text-align": "right" },
	"wrap": { "flex-wrap": "wrap" },
	"wrap-reverse": { "flex-wrap": "wrap-reverse" },
	"nowrap": { "flex-wrap": "no-wrap" },
	"rounded": { "border-radius": "50%" },
	"fit-cover": { "object-fit": "cover" },
	"fit-contain": { "object-fit": "contain" },
	"fit-fill": { "object-fit": "fill" },
	"overflow-hidden": { "overflow": "hidden" },
	"overflow-scroll": { "overflow": "scroll" },
	"transparent": { "opacity": "0" },
	"opaque": { "opacity": "1" },
	"no-pointer": { "pointer-events": "none" },
	"cursor-pointer": { "cursor": "pointer" },
	"center-abs": {
		"position": "absolute",
		"top": "50%",
		"left": "50%",
		"transform": "translate(-50%, -50%)",
	},
}

for (let i = 0; i <= 10; i++) {
	c[`o-${i}`] = { "opacity": i / 10 }
}

for (let i = 1; i <= 8; i++) {
	c[`grow-${i}`] = { "flex-grow": i + "" }
	c[`shrink-${i}`] = { "flex-shrink": i + "" }
	c[`flex-${i}`] = { "flex": i + "" }
}

for (let i = -8; i <= 8; i++) {
	c[`z-${i}`] = { "z-index": `${i}` }
}

for (let i = 1; i <= 8; i++) {
	c[`c-${i}`] = { "color": `var(--c-${i})` }
	c[`bg-${i}`] = { "background": `var(--bg-${i})` }
	c[`fs-${i}`] = { "font-size": `var(--fs-${i})` }
}

const spaces = [2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96, 128]

for (const s of spaces) {
	c[`g-${s}`] = { "gap": `${s}px` }
	c[`p-${s}`] = { "padding": `${s}px` }
	c[`px-${s}`] = { "padding-left": `${s}px`, "padding-right": `${s}px` }
	c[`py-${s}`] = { "padding-top": `${s}px`, "padding-bottom": `${s}px` }
	c[`m-${s}`] = { "margin": `${s}px` }
	c[`mx-${s}`] = { "margin-left": `${s}px`, "margin-right": `${s}px` }
	c[`my-${s}`] = { "margin-top": `${s}px`, "margin-bottom": `${s}px` }
	c[`f-${s}`] = { "font-size": `${s}px` }
	c[`r-${s}`] = { "border-radius": `${s}px` }
}

const colors = [ "red", "green", "blue", "black", "white" ]

for (const color of colors) {
	c[`${color}`] = { "background-color": color }
}

for (let i = 1; i <= 8; i++) {
	c[`col-${i}`] = { "grid-template-columns": `repeat(${i}, 1fr)` }
}


const autocol = (w: number, min: number, max: number) => ({
	"grid-template_columns": `repeat(auto-fit, minmax(min(100% / ${min}, max(${w}, 100% / ${max})), 1fr))`
})

for (let i = 1; i <= 64; i++) {
	const px = i * 20
	c[`w-${px}`] = { "width": `${px}px` }
	c[`h-${px}`] = { "height": `${px}px` }
	c[`colw-${px}`] = { "grid-template-columns": `repeat(auto-fill, minmax(min(100%, ${px}px), 1fr))` }
}

export function cc(styles: string[] | string) {
	if (typeof styles === "string") {
		return cc(styles.split(" "))
	}
	let sheet: StyleSheet = {}
	for (const s of styles) {
		if (c[s]) {
			Object.assign(sheet, c[s])
		}
	}
	return sheet
}

export type CSSLibOpts = {
	breakpoints?: Record<string, number>,
}

// TODO: a way to only generate used classes, record in h()?
// TODO: deal with pseudos like :hover
export function csslib(opt: CSSLibOpts = {}) {

	const compileStyles = (sheet: Record<string, StyleSheet>) => {
		const nl = " "
		let css = ""
		for (const sel in sheet) {
			css += `.${sel} { ${style(sheet[sel])} }${nl}\n`
		}
		return css
	}

	let css = compileStyles(c)
	const breakpoints = opt.breakpoints ?? {}

	for (const bp in breakpoints) {
		css += `@media (max-width: ${breakpoints[bp]}px) {`
		css += compileStyles(mapKeys(c, (sel) => `.${bp}:${sel.substring(1)}`))
		css += `}`
	}

	return css

}
