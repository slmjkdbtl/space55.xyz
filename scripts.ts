import { js } from "www/html"
import "./client/index" with { type: "text" }
import "./client/poop" with { type: "text" }
import "./client/lilfang" with { type: "text" }

export default {
	index: await js("client/index.ts"),
	poop: await js("client/poop.ts"),
	lilfang: await js("client/lilfang.ts"),
}
