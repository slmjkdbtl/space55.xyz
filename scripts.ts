import { js } from "www/html"
import "./client/games" with { type: "text" }
import "./client/poop" with { type: "text" }
import "./client/fantasyspinkick" with { type: "text" }
import "./client/littlesongs" with { type: "text" }

export default {
	games: await js("client/games.ts"),
	poop: await js("client/poop.ts"),
	fantasyspinkick: await js("client/fantasyspinkick.ts"),
	littlesongs: await js("client/littlesongs.ts"),
}
