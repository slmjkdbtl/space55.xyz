import * as fs from "fs/promises"
import * as path from "path"
import {
	Handler,
	cron,
} from "./www"

export type FileHostOpts = {
	dir: string,
	lifespan: number,
}

export default function createFileHost(opts: FileHostOpts) {

	const handler: Handler = async ({ req, res, next }) => {
		const data = await req.formData()
		const file = data.get("file") as File
		Bun.write(path.join(opts.dir, file.name), file)
		const url = `${req.url.origin}/${opts.dir}/${file.name}`
		res.sendText(url + "\n")
	}

	const check = async () => {
		const files = await fs.readdir(opts.dir)
		const now = Date.now()
		for (const file of files) {
			const p = path.join(opts.dir, file)
			const stat = await fs.stat(p)
			const age = now - stat.birthtime.getTime()
			const hours = age / 1000 / 60 / 60
			if (hours >= opts.lifespan) {
				await fs.unlink(p)
			}
		}
	}

	const clear = async () => {
		const files = await fs.readdir(opts.dir)
		for (const file of files) {
			const p = path.join(opts.dir, file)
			await fs.unlink(p)
		}
	}

	cron("minutely", check)

	return {
		handler,
		check,
		clear,
	}

}
