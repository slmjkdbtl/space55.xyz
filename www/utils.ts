export const isDev = typeof Bun === "undefined"
	? false
	: Boolean(Bun.env["DEV"])
export const isBrowser = typeof window !== "undefined"
export const isTouch = isBrowser && (("ontouchstart" in window) || navigator.maxTouchPoints > 0)

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
