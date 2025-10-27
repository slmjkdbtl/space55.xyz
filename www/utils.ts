export const isDev = typeof Bun === "undefined"
	? false
	: Boolean(Bun.env["DEV"])

export class Registry<T> extends Map<number, T> {
	private lastID: number = 0
	push(v: T): number {
		const id = this.lastID
		this.set(id, v)
		this.lastID++
		return id
	}
	pushd(v: T): () => void {
		const id = this.push(v)
		return () => this.delete(id)
	}
}

export class Event<Arg = void> {
	#handlers: Registry<(arg: Arg) => void> = new Registry()
	add(action: (arg: Arg) => void): EventController {
		const cancel = this.#handlers.pushd((arg: Arg) => {
			if (ev.paused) return
			action(arg)
		})
		const ev = new EventController(cancel)
		return ev
	}
	addOnce(action: (arg: Arg) => void): EventController {
		const ev = this.add((arg) => {
			ev.cancel()
			action(arg)
		})
		return ev
	}
	next(): Promise<Arg> {
		return new Promise((res) => this.addOnce(res))
	}
	trigger(arg: Arg) {
		this.#handlers.forEach((action) => action(arg))
	}
	numListeners(): number {
		return this.#handlers.size
	}
	clear() {
		this.#handlers.clear()
	}
}

export class EventController {
	paused: boolean = false
	readonly cancel: () => void
	constructor(cancel: () => void) {
		this.cancel = cancel
	}
	static join(events: EventController[]): EventController {
		const ev = new EventController(() => events.forEach((e) => e.cancel()))
		Object.defineProperty(ev, "paused", {
			get: () => events[0].paused,
			set: (p: boolean) => events.forEach((e) => e.paused = p),
		})
		ev.paused = false
		return ev
	}
}

export function deepEq(o1: any, o2: any): boolean {
	if (o1 === o2) {
		return true
	}
	const t1 = typeof o1
	const t2 = typeof o2
	if (t1 !== t2) {
		return false
	}
	if (t1 === "object" && t2 === "object" && o1 !== null && o2 !== null) {
		if (Array.isArray(o1) !== Array.isArray(o2)) {
			return false
		}
		const k1 = Object.keys(o1)
		const k2 = Object.keys(o2)
		if (k1.length !== k2.length) {
			return false
		}
		for (const k of k1) {
			const v1 = o1[k]
			const v2 = o2[k]
			if (!deepEq(v1, v2)) {
				return false
			}
		}
		return true
	}
	return false
}

export const trydo = overload2(<T>(action: () => T, def: T) => {
	try {
		return action()
	} catch {
		return def
	}
}, <T>(action: () => T) => {
	return trydo(action, null)
})

type Func = (...args: any[]) => any

export function overload2<A extends Func, B extends Func>(fn1: A, fn2: B): A & B {
	return ((...args) => {
		const al = args.length
		if (al === fn1.length) return fn1(...args)
		if (al === fn2.length) return fn2(...args)
	}) as A & B
}

export function overload3<
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

export function overload4<
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

export function mapKeys<D>(obj: Record<string, D>, mapFn: (k: string) => string) {
	return Object.keys(obj).reduce((result: Record<string, D>, key) => {
		result[mapFn(key)] = obj[key]
		return result
	}, {})
}

export function mapValues<A, B>(obj: Record<string, A>, mapFn: (v: A) => B) {
	return Object.keys(obj).reduce((result: Record<string, B>, key) => {
		result[key] = mapFn(obj[key])
		return result
	}, {})
}

export type KV = Record<string, string | boolean | number>

export function buildKV(props: KV) {
	return Object.entries(props)
		.filter(([k, v]) => v)
		.map(([k, v]) => v === true ? k : `${k}=${v}`)
		.join("; ")
}

export function parseKV(kv: string): KV {
	const data: KV = {}
	for (const c of kv.split(";")) {
		const [k, v] = c.split("=").map((v) => v.trim())
		data[k] = v ?? true
		if (Number(v) + "" === v) {
			data[k] = Number(v)
		}
	}
	return data
}

const alphaNumChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

export function randAlphaNum(len: number = 8) {
	let str = ""
	for (let i = 0; i < len; i++) {
		str += alphaNumChars.charAt(Math.floor(Math.random() * alphaNumChars.length))
	}
	return str
}

export const ansi = {
	reset:     "\x1b[0m",
	black:     "\x1b[30m",
	red:       "\x1b[31m",
	green:     "\x1b[32m",
	yellow:    "\x1b[33m",
	blue:      "\x1b[34m",
	magenta:   "\x1b[35m",
	cyan:      "\x1b[36m",
	white:     "\x1b[37m",
	blackbg:   "\x1b[40m",
	redbg:     "\x1b[41m",
	greenbg:   "\x1b[42m",
	yellowbg:  "\x1b[43m",
	bluebg:    "\x1b[44m",
	magentabg: "\x1b[45m",
	cyanbg:    "\x1b[46m",
	whitebg:   "\x1b[47m",
	bold:      "\x1b[1m",
	dim:       "\x1b[2m",
	italic:    "\x1b[3m",
	underline: "\x1b[4m",
	rgb: (r: number, g: number, b: number) => `\x1b[38;2;${r};${g};${b}m`,
	rgbbg: (r: number, g: number, b: number) => `\x1b[48;2;${r};${g};${b}m`,
}

// in bytes
export const KB = 1024
export const MB = KB * 1024
export const GB = MB * 1024
export const TB = GB * 1024

// in ms
export const SECOND = 1000
export const MINUTE = SECOND * 60
export const HOUR = MINUTE * 60
export const DAY = HOUR * 24
export const WEEK = DAY * 7
export const MONTH = DAY * 30
export const YEAR = DAY * 365

export type CronUnit = string
export type CronRule =
	| `${CronUnit} ${CronUnit} ${CronUnit} ${CronUnit} ${CronUnit}`
	| "yearly"
	| "monthly"
	| "weekly"
	| "daily"
	| "hourly"
	| "minutely"

const isReal = (n: any) => n !== undefined && n !== null && !isNaN(n)

// TODO: support intervals
export function cron(rule: CronRule, action: () => void) {
	if (rule === "yearly") return cron("0 0 1 1 *", action)
	if (rule === "monthly") return cron("0 0 1 * *", action)
	if (rule === "weekly") return cron("0 0 * * 0", action)
	if (rule === "daily") return cron("0 0 * * *", action)
	if (rule === "hourly") return cron("0 * * * *", action)
	if (rule === "minutely") return cron("* * * * *", action)
	let paused = false
	const [min, hour, date, month, day] = rule
		.split(" ")
		.map((def) => def === "*" ? "*" : new Set(def.split(",").map(Number).filter(isReal)))
	function run() {
		if (paused) return
		const now = new Date()
		if (month !== "*" && !month.has(now.getUTCMonth() + 1)) return
		if (date !== "*" && !date.has(now.getUTCDate())) return
		if (day !== "*" && !day.has(now.getUTCDay())) return
		if (hour !== "*" && !hour.has(now.getUTCHours())) return
		if (min !== "*" && !min.has(now.getUTCMinutes())) return
		action()
	}
	const timeout = setInterval(run, 1000 * 60)
	run()
	return {
		action: action,
		cancel: () => clearInterval(timeout),
		get paused() {
			return paused
		},
		set paused(p) {
			paused = p
		},
	}
}

export function fmtBytes(bytes: number, decimals: number = 2) {
	if (bytes === 0) return "0b"
	const k = 1024
	const dm = decimals < 0 ? 0 : decimals
	const sizes = ["b", "kb", "mb", "gb", "tb", "pb"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	const size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm))
	return `${size}${sizes[i]}`
}

export async function mapAsync<T, U>(
	arr: T[],
	fn: (item: T, index: number, arr: T[]) => Promise<U>
): Promise<U[]> {
	return Promise.all(arr.map(fn))
}

export function isPromise(value: any): value is Promise<any> {
	return (
		value !== null &&
		typeof value === "object" &&
		typeof value.then === "function" &&
		typeof value.catch === "function"
	)
}

export function getErrorMsg(error: unknown) {
	return (error instanceof Error) ? error.message : String(error)
}

const enum EnumRunesCode {
	HIGH_SURROGATE_START = 0xd800,
	HIGH_SURROGATE_END = 0xdbff,

	LOW_SURROGATE_START = 0xdc00,

	REGIONAL_INDICATOR_START = 0x1f1e6,
	REGIONAL_INDICATOR_END = 0x1f1ff,

	FITZPATRICK_MODIFIER_START = 0x1f3fb,
	FITZPATRICK_MODIFIER_END = 0x1f3ff,

	VARIATION_MODIFIER_START = 0xfe00,
	VARIATION_MODIFIER_END = 0xfe0f,

	DIACRITICAL_MARKS_START = 0x20d0,
	DIACRITICAL_MARKS_END = 0x20ff,

	SUBDIVISION_INDICATOR_START = 0x1f3f4,
	TAGS_START = 0xe0000,
	TAGS_END = 0xe007f,

	ZWJ = 0x200d,
}

const GRAPHEMES = Object.freeze([
	0x0308, // ( ◌̈ ) COMBINING DIAERESIS
	0x0937, // ( ष ) DEVANAGARI LETTER SSA
	0x093F, // ( ि ) DEVANAGARI VOWEL SIGN I
	0x0BA8, // ( ந ) TAMIL LETTER NA
	0x0BBF, // ( ி ) TAMIL VOWEL SIGN I
	0x0BCD, // ( ◌்) TAMIL SIGN VIRAMA
	0x0E31, // ( ◌ั ) THAI CHARACTER MAI HAN-AKAT
	0x0E33, // ( ำ ) THAI CHARACTER SARA AM
	0x0E40, // ( เ ) THAI CHARACTER SARA E
	0x0E49, // ( เ ) THAI CHARACTER MAI THO
	0x1100, // ( ᄀ ) HANGUL CHOSEONG KIYEOK
	0x1161, // ( ᅡ ) HANGUL JUNGSEONG A
	0x11A8, // ( ᆨ ) HANGUL JONGSEONG KIYEOK
])

enum EnumCodeUnits {
	unit_1 = 1,
	unit_2 = 2,
	unit_4 = 4,
}

export function runes(string: string): string[] {
	if (typeof string !== "string") {
		throw new TypeError("string cannot be undefined or null")
	}
	const result: string[] = []
	let i = 0
	let increment = 0
	while (i < string.length) {
		increment += nextUnits(i + increment, string)
		if (isGrapheme(string[i + increment])) {
			increment++
		}
		if (isVariationSelector(string[i + increment])) {
			increment++
		}
		if (isDiacriticalMark(string[i + increment])) {
			increment++
		}
		if (isZeroWidthJoiner(string[i + increment])) {
			increment++
			continue
		}
		result.push(string.substring(i, i + increment))
		i += increment
		increment = 0
	}
	return result
}

// Decide how many code units make up the current character.
// BMP characters: 1 code unit
// Non-BMP characters (represented by surrogate pairs): 2 code units
// Emoji with skin-tone modifiers: 4 code units (2 code points)
// Country flags: 4 code units (2 code points)
// Variations: 2 code units
// Subdivision flags: 14 code units (7 code points)
function nextUnits(i: number, string: string) {
	const current = string[i]
	// If we don't have a value that is part of a surrogate pair, or we're at
	// the end, only take the value at i
	if (!isFirstOfSurrogatePair(current) || i === string.length - 1) {
		return EnumCodeUnits.unit_1
	}

	const currentPair = current + string[i + 1]
	const nextPair = string.substring(i + 2, i + 5)

	// Country flags are comprised of two regional indicator symbols,
	// each represented by a surrogate pair.
	// See http://emojipedia.org/flags/
	// If both pairs are regional indicator symbols, take 4
	if (isRegionalIndicator(currentPair) && isRegionalIndicator(nextPair)) {
		return EnumCodeUnits.unit_4
	}

	// https://unicode.org/emoji/charts/full-emoji-list.html#subdivision-flag
	// See https://emojipedia.org/emoji-tag-sequence/
	// If nextPair is in Tags(https://en.wikipedia.org/wiki/Tags_(Unicode_block)),
	// then find next closest U+E007F(CANCEL TAG)
	if (isSubdivisionFlag(currentPair) &&	isSupplementarySpecialpurposePlane(nextPair)) {
		return string.slice(i).indexOf(String.fromCodePoint(EnumRunesCode.TAGS_END)) + 2
	}

	// If the next pair make a Fitzpatrick skin tone
	// modifier, take 4
	// See http://emojipedia.org/modifiers/
	// Technically, only some code points are meant to be
	// combined with the skin tone modifiers. This function
	// does not check the current pair to see if it is
	// one of them.
	if (isFitzpatrickModifier(nextPair)) {
		return EnumCodeUnits.unit_4
	}
	return EnumCodeUnits.unit_2
}

function isFirstOfSurrogatePair(string: string) {
	return string && betweenInclusive(string[0].charCodeAt(0), EnumRunesCode.HIGH_SURROGATE_START, EnumRunesCode.HIGH_SURROGATE_END)
}

function isRegionalIndicator(string: string) {
	return betweenInclusive(codePointFromSurrogatePair(string), EnumRunesCode.REGIONAL_INDICATOR_START, EnumRunesCode.REGIONAL_INDICATOR_END)
}

function isSubdivisionFlag(string: string) {
	return betweenInclusive(codePointFromSurrogatePair(string),	EnumRunesCode.SUBDIVISION_INDICATOR_START, EnumRunesCode.SUBDIVISION_INDICATOR_START)
}

function isFitzpatrickModifier(string: string) {
	return betweenInclusive(codePointFromSurrogatePair(string), EnumRunesCode.FITZPATRICK_MODIFIER_START, EnumRunesCode.FITZPATRICK_MODIFIER_END)
}

function isVariationSelector(string: string) {
	return typeof string === "string" && betweenInclusive(string.charCodeAt(0), EnumRunesCode.VARIATION_MODIFIER_START, EnumRunesCode.VARIATION_MODIFIER_END)
}

function isDiacriticalMark(string: string) {
	return typeof string === "string" && betweenInclusive(string.charCodeAt(0), EnumRunesCode.DIACRITICAL_MARKS_START, EnumRunesCode.DIACRITICAL_MARKS_END)
}

function isSupplementarySpecialpurposePlane(string: string) {
	const codePoint = string.codePointAt(0)
	return (typeof string === "string" &&	typeof codePoint === "number" && betweenInclusive(codePoint, EnumRunesCode.TAGS_START, EnumRunesCode.TAGS_END))
}

function isGrapheme(string: string) {
	return typeof string === "string" && GRAPHEMES.includes(string.charCodeAt(0))
}

function isZeroWidthJoiner(string: string) {
	return typeof string === "string" && string.charCodeAt(0) === EnumRunesCode.ZWJ
}

function codePointFromSurrogatePair(pair: string) {
	const highOffset = pair.charCodeAt(0) - EnumRunesCode.HIGH_SURROGATE_START
	const lowOffset = pair.charCodeAt(1) - EnumRunesCode.LOW_SURROGATE_START
	return (highOffset << 10) + lowOffset + 0x10000
}

function betweenInclusive(value: number, lower: number, upper: number) {
	return value >= lower && value <= upper
}

export function substring(string: string, start?: number, width?: number) {
	const chars = runes(string)
	if (start === undefined) {
		return string
	}
	if (start >= chars.length) {
		return ""
	}
	const rest = chars.length - start
	const stringWidth = width === undefined ? rest : width
	let endIndex: number | undefined = start + stringWidth
	if (endIndex > (start + rest)) {
		endIndex = undefined
	}
	return chars.slice(start, endIndex).join("")
}
