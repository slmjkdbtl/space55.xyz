import * as path from "node:path"
import * as crypto from "node:crypto"
import * as fs from "node:fs/promises"
import {
	dbPath,
	createDatabase,
	randAlphaNum,
	cron,
	HTTPError,
} from "./www"
import type { Handler } from "./www"

// TODO: be able to mount on any endpoint

const TOKEN = Bun.env["TOKEN"]
const db = createDatabase(dbPath("space55.xyz", "tmp.db"))

type DBFile = {
	id: string,
	hash: string,
	type: string,
	data: Uint8Array,
}

const fileTable = db.table<DBFile>("file", {
	"id":   { type: "TEXT", primaryKey: true },
	"hash": { type: "TEXT", index: true },
	"type": { type: "TEXT" },
	"data": { type: "BLOB" },
}, {
	timeCreated: true,
	timeUpdated: true,
})

const gate = (handler: Handler): Handler => {
	return (ctx) => {
		const { req, res } = ctx
		const auth = req.headers.get("Authorization")
		if (auth !== `Bearer ${TOKEN}`) {
			throw new HTTPError(401, "nope")
		}
		return handler(ctx)
	}
}

export const download: Handler = (ctx) => {
	const { req, res } = ctx
	const id = req.params["id"]
	const file = fileTable.find({ id: id })
	if (!file) {
		throw new HTTPError(404, "not found")
	}
	res.send(file["data"], {
		headers: {
			"Content-Type": file["type"],
		}
	})
}

export const upload: Handler = gate(async (ctx) => {
	const { req, res } = ctx
	let contentType = req.headers.get("Content-Type")
	if (contentType === "application/x-www-form-urlencoded") {
		contentType = "text/plain"
	}
	const { data, type } = await (async () => {
		if (contentType?.startsWith("multipart/form-data")) {
			const form = await req.formData()
			const file = form.get("file")
			if (!file || !(file instanceof File)) {
				throw new HTTPError(400, "no file")
			}
			const bytes = await file.bytes()
			return {
				data: bytes,
				type: file.type,
			}
		} else if (contentType?.startsWith("text/")) {
			const text = await req.text()
			const encoder = new TextEncoder()
			const bytes = encoder.encode(text)
			return {
				data: bytes,
				type: contentType,
			}
		} else {
			throw new HTTPError(400, "no data")
		}
	})()
	const hash = crypto.createHash("sha256").update(data).digest("base64")
	const id = (() => {
		const existing = fileTable.find({ hash: hash })
		if (existing) {
			return existing.id
		}
		// TODO: deal with ID collision
		const id = randAlphaNum()
		fileTable.insert({
			id,
			hash,
			type,
			data,
		})
		return id
	})()
	res.sendText(`${req.url.protocol}//${req.url.host}${req.url.pathname}/${id}`)
})

export const purge: Handler = gate((ctx) => {
	const { req, res } = ctx
	fileTable.clear()
})

const SECOND = 1000
const MINUTE = SECOND * 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24
const WEEK = DAY * 7
const MONTH = DAY * 30
const YEAR = DAY * 365

export function clean() {
	const files = fileTable.select()
	const now = new Date().getTime()
	for (const file of files) {
		const timeCreated = new Date(file["time_created"]).getTime()
		const diff = now - timeCreated
		if (diff > MONTH) {
			fileTable.delete({ id: file["id"] })
		}
	}
}

clean()

export const runCleaner = () => setInterval(clean, HOUR)
