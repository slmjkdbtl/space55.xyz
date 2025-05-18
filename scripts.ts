import { js } from "./www"
import "./client/index" with { type: "text" }
import "./client/poop" with { type: "text" }

export default {
	index: await js("client/index.ts"),
	poop: await js("client/poop.ts"),
}
