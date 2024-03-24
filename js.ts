import { h, css } from "./www"

const styles = {
	// TODO
}

export default "<!DOCTYPE html>" + h("html", { lang: "en" }, [
	h("head", {}, [
		h("title", {}, "tga's js things"),
		h("meta", { charset: "utf-8", }),
		h("meta", { name: "description", content: "tga's js things", }),
		h("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
		h("link", { rel: "icon", href: "/static/img/icon.png" }),
		h("style", {}, css(styles)),
	]),
	h("body", {}, [
	]),
])
