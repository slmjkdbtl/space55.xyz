// tmp file hoster like 0x0.st

import * as path from "node:path"
import * as crypto from "node:crypto"
import * as fs from "node:fs/promises"
import {
	dbPath,
	createDatabase,
	randAlphaNum,
	cron,
	HTTPError,
	MB,
	MONTH,
	HOUR,
	fmtBytes,
} from "./www"
import type { Handler } from "./www"

// TODO: be able to mount on any endpoint

const MAX_SIZE = MB * 64
const EXPIRE_TIME = MONTH * 30

const TOKEN = Bun.env["TOKEN"]
const db = await createDatabase(dbPath("space55.xyz", "tmp.db"))

type DBFile = {
	id: string,
	hash: string,
	type: string,
	size: number,
	data: Uint8Array,
}

const fileTable = db.table<DBFile>("file", {
	"id":   { type: "TEXT", primaryKey: true },
	"hash": { type: "TEXT", index: true },
	"type": { type: "TEXT" },
	"size": { type: "INTEGER" },
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
	let contentLength = Number(req.headers.get("Content-Length"))
	if (!contentLength || contentLength > MAX_SIZE) {
		throw new HTTPError(400, "too big")
	}
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
			throw new HTTPError(400, `data type not supported: ${contentType}`)
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
			size: data.byteLength,
		})
		return id
	})()
	res.sendText(`${req.url.protocol}//${req.url.host}${req.url.pathname}/${id}`)
})

export const purge: Handler = gate((ctx) => {
	const { req, res } = ctx
	fileTable.clear()
	res.sendText("ok")
})

export const remove: Handler = gate((ctx) => {
	const { req, res } = ctx
	const id = req.params["id"]
	fileTable.delete({ id: id })
	res.sendText("ok")
})

export const browse: Handler = (ctx) => {
	// TODO
	const { req, res } = ctx
	const files = fileTable.select()
	res.sendText("TODO")
}

export function removeExpired() {
	const files = fileTable.select()
	const now = new Date().getTime()
	for (const file of files) {
		const timeCreated = new Date(file["time_created"]).getTime()
		const diff = now - timeCreated
		if (diff > EXPIRE_TIME) {
			fileTable.delete({ id: file["id"] })
		}
	}
}

export const runCleaner = () => setInterval(removeExpired, HOUR)
