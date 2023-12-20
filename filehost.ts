import * as fs from "fs/promises"
import * as path from "path"
import {
	cron,
	Handler,
} from "./www"


const DIR = "static/tmp"
const HOURS = 1 * 24

async function check() {
	const files = await fs.readdir(DIR)
	const now = Date.now()
	for (const file of files) {
		const p = path.join(DIR, file)
		const stat = await fs.stat(p)
		const age = now - stat.birthtime.getTime()
		const hours = age / 1000 / 60 / 60
		if (hours >= HOURS) {
			await fs.unlink(p)
		}
	}
}

cron(0, "*", "*", "*", "*", check)

const handler: Handler = async ({ req, res, next }) => {
	const data = await req.formData()
	const file = data.get("file") as File
	Bun.write(path.join(DIR, file.name), file)
	const url = `${req.url.origin}/${DIR}/${file.name}`
	res.sendText(url + "\n")
}

export default handler
