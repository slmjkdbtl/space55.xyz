import { h, css, csslib, cc } from "./www"

const dic: Record<string, string> = {
	"日本語": "にほんご",
	"勉強": "べんきょう",
	"河童": "かっぱ",
	"猫": "ねこ",
	"魚": "さかな",
	"虎": "とら",
	"運命": "うんめ",
	"今": "いま",
	"昨日": "きのう",
	"今日": "きょ",
	"明日": "あした",
	"何時": "なんじ",
	"何": "なん",
	"梅津": "うめず",
	"可愛": "かわい",
	"赤": "あか",
	"暑": "あつ",
	"私": "わたし",
	"好": "す",
	"海": "うみ",
	"難": "むずか",
	"空": "そら",
	"素晴": "すば",
	"本": "ほん",
	"面白": "おもしろ",
	"幼稚園": "ようちえん",
	"先生": "せんせい",
	"母": "かあ",
	"仕事": "しごと",
	"誰": "だれ",
	"人": "ひと",
	"甘": "あま",
	"塊": "かたまり",
	"魂": "たましい",
	"楽": "たの",
}

let blockIndex = 0

function block(title: string, content: string[]) {
	blockIndex += 1
	return h("div", { class: "vstack g-16" }, [
		h("div", { class: "hstack g-12 align-end" }, [
			h("p", { class: "num" }, blockIndex),
			h("h2", { class: "c-1" }, k(title)),
		]),
		...content,
	])
}

function desc(d: string) {
	return h("p", { class: "desc" }, d)
}

function note(d: string | string[]) {
	return h("div", { class: "note" }, d)
}

function k(word: string, furigana: string = dic[word]) {
	return furigana
		? `<ruby>${word}<rp>(</rp><rt>${furigana}</rt><rp>)</rp></ruby>`
		: `<ruby>${word}</ruby>`
}

function kk(words: string[]) {
	return words.map((w) => k(w)).join("")
}

export type Example = [ string[], string ]

function example(phrase: string[], trans: string) {
	return h("div", { class: "vstack" }, [
		h("p", { class: "example" }, kk(phrase)),
		h("p", { class: "example-trans" }, trans),
	])
}

function examples(e: Example[]) {
	return h("div", { class: "examples" }, e.map(([ p, t ]) => example(p, t)))
}

const styles = {
	":root": {
		"--c-1": "rgb(255, 255, 255)",
		"--c-2": "rgb(255, 180, 170)",
		"--c-3": "rgb(130, 53, 47)",
		"--bg-1": "rgb(90, 13, 7)",
		"--bg-2": "rgb(105, 28, 22)",
		// "--c-1": "rgb(20, 20, 20)",
		// "--c-2": "rgb(60, 60, 60)",
		// "--c-3": "rgb(120, 120, 120)",
		// "--bg-1": "rgb(255, 255, 255)",
		// "--bg-2": "rgb(230, 230, 230)",
		"font-size": "20px",
	},
	"*": {
		"box-sizing": "border-box",
		"margin": "0",
		"padding": "0",
	},
	"html": {
		"width": "100%",
	},
	"body": {
		"width": "100%",
		"background": "url(/static/img/dragonback.gif)",
		"background-size": "120px",
		// "background": "url(/static/img/sky2.png)",
		// "background-size": "1200px",
		"color": "var(--c-1)",
		"font-family": "monospace",
	},
	"main": {
		"max-width": "640px",
		"width": "100%",
		"padding": "32px",
		"margin": "100px auto",
		"background": "var(--bg-1)",
		"color": "white",
		"font-family": "test",
		"border-radius": "4px",
	},
	"h1": {
		"font-size": "3rem",
	},
	"h2": {
		"font-size": "2rem",
	},
	"b": {
		"font-weight": "800",
	},
	"ul": {
		"padding": "16px",
		"list-style": "inside",
	},
	"rt": {
		"color": "var(--c-2)",
	},
	".num": {
		"font-size": "1.5rem",
		"color": "var(--c-3)",
		"font-weight": "900",
	},
	".desc": {
		"color": "var(--c-2)",
	},
	".note": {
		"color": "var(--c-1)",
		"background": "var(--bg-2)",
		"padding": "16px",
		"border-radius": "4px",
	},
	".examples": {
		...cc("vstack g-8"),
		"padding": "16px",
	},
	".example": {
		"font-size": "1rem",
		"color": "var(--c-1)",
	},
	".example-trans": {
		"font-size": "1rem",
		"color": "var(--c-2)",
	},
	"@font-face": [
		{
			"font-family": "test",
			"src": `url("/static/fonts/NotoSerifJP.woff2")`,
			"font-display": "block",
		},
	],
}

const grammar = [
	block("A は B です。", [
		desc("A is B."),
		examples([
			[ ["河童", "<b>は</b>", "可愛", "い<b>です</b>。"], "Kappa is cute." ],
			[ ["これ<b>は</b>", "運命", "<b>です</b>。"], "This is fate." ],
			[ ["梅津", "さんのバナナ<b>です</b>。"], "It is Mr. Umezu's Banana." ],
		]),
		note("<b>は</b> is the topic marking particle, it marks the noun before it as the topic of the sentence. We will talk more about it later."),
		note("You can replace <b>です</b> with <b>だ</b> when speaking casual."),
		examples([
			[ ["今日", "<b>は</b>", "日曜日<b>だ</b>。"], "Today is sunday." ],
		]),
	]),
	block("A は B ですか。", [
		desc("Is A B?"),
		examples([
			[ ["今日", "<b>は</b>", "暑い<b>ですか</b>。"], "Is today hot?" ],
			[ ["あれ<b>は</b>トム<b>ですか</b>。"], "Is that Tom?" ],
			[ ["今", "何時", "<b>ですか</b>。"], "What time is it?" ],
			[ ["これ<b>は</b>", "運命", "<b>ですか</b>。"], "Is this fate?" ],
			[ ["それ<b>は</b>なん<b>ですか</b>。"], "What is that?" ],
			[ ["そう<b>ですか</b>。"], "Is that so?" ],
		]),
		note("You dont't need to use question mark <b>?</b> when ending a question with <b>か</b>"),
	]),
	block("A は B でわありません。", [
		desc("A is not B. (B is a <b>noun</b> or <b>な</b> adjective)"),
		examples([
			[ ["猫", "<b>は</b>", "魚", "<b>でわありません</b>。"], "Cats are not fish." ],
		]),
		note([
			"<b>でわ</b> can be replaced by <b>じゃ</b>",
		]),
		examples([
			[ ["虎", "<b>は</b>", "赤", "い<b>じゃありません</b>。"], "Tigers are not red." ],
		]),
		note([
			"<b>ありません</b> can be replaced by <b>ない</b>",
		]),
		examples([
			[ ["私", "はリンゴが", "好", "き<b>じゃない</b>。"], "I don't like apple." ],
			[ ["海", "はきれい", "<b>じゃないです</b>。"], "Oceans are not pretty." ],
			[ ["これは", "運命", "<b>ではない</b>。"], "This is not fate." ],
		]),
		note("This is used for <b>nouns</b> and <b>な</b> adjectives. For <b>い</b> adjectives see below."),
	]),
	block("A は B くない。", [
		desc("A is not B. (B is a <b>い</b> adjective)"),
		examples([
			[ ["明日", "は", "暑", "<b>くない</b>。"], "Tomorrow is not hot." ],
			[ ["日本語", "は", "難", "し<b>くない</b>です。"], "Japanese is not hard." ],
		]),
		note("We're replacing <b>い</b> with <b>く</b> and adding <b>ない</b> to make an <b>い</b> adjective negative."),
	]),
	block("A は B でした。", [
		desc("A was B."),
		examples([
			[ ["昨日", "の", "空", "がきれい<b>でした</b>。"], "Sky was pretty yesterday." ],
		]),
	]),
	block("A の B", [
		desc("A describes more information about noun B."),
		examples([
			[ ["デイビッド<b>の</b>サックス"], "David's saxophone." ],
			[ ["私", "<b>の</b>お", "母", "さんは", "幼稚園", "</b>の</b>", "先生", "です。"], "My mom is a kindergarten teacher." ],
			[ ["梅津", "さんわ", "何", "の", "仕事", "ですか。"], "What do you do for work, Mr. Umezu?" ],
		]),
	]),
	block("これ、それ、あれ、どれ", [
		desc("これ = this<br>それ = that (close to the listener)<br>あれ = that (far away)<br>どれ = which"),
		examples([
			[ ["<b>これ</b>は私のバナナです。"], "This is my banana." ],
			[ ["<b>それ</b>は何ですか。"], "What is that?" ],
			[ ["<b>どれ</b>？"], "Which one?" ],
		]),
		note("<b>どれ</b> is used when there's equal or more than 3 items."),
	]),
	block("この、その、あの、どの", [
		desc("Like これ、それ and あれ but a noun must be followed by a noun."),
		examples([
			[ ["<b>この</b>", "本", "は", "面白", "いですか。"], "Is this book interesting?" ],
			[ ["<b>あの</b>バナナは", "素晴", "らしい。"], "That banana is magnificent." ],
		]),
	]),
	block("ここ、そこ、あそこ、どこ", [
		desc("ここ = here<br>そこ = there (close to the listener)<br>あそこ = there (far away)<br>どこ = where"),
		examples([
			[ ["<b>ここ</b>は<b>どこ</b>ですか。"], "Where is here?" ],
			[ ["<b>そこ</b>じゃない、<b>あそこ</b>です。"], "It's not there, it's over there." ],
			[ ["デイビッドは<b>どこ</b>ですか。"], "Where's David?" ],
			[ ["<b>どこ</b>の", "人", "ですか。"], "Where are you from?" ],
		]),
	]),
	block("誰", [
		desc("Who"),
		examples([
			[ ["あれは<b>", "誰", "</b>?"], "Who's that?" ],
			[ ["これは<b>", "誰", "</b>のギターですか？"], "Whose guitar is this?" ],
		]),
	]),
	block("も", [
		desc("Too"),
		examples([
			[ ["バナナは", "甘", "いです、りんご<b>も</b>", "甘", "いです。"], "Bananas are sweet, apples are sweet too." ],
			[ ["これ<b>も</b>？"], "This too?" ],
		]),
	]),
	block("ね", [
		desc("Put at sentence end to ask for confirmation. Right? Don't you think?"),
		examples([
			[ ["可愛", "いだ<b>ね</b>?"], "Cute, isn't it?" ],
		]),
	]),
	block("よ", [
		desc("Put at sentence end to emphasize confirmation. You know. I'm telling you."),
		examples([
			[ ["塊", "魂", "は", "楽", "しいです<b>よ</b>."], "Katamari Damacy is fun, for sure." ],
		]),
	]),
]

export default "<!DOCTYPE html>" + h("html", { lang: "en" }, [
	h("head", {}, [
		h("title", {}, "Learn Japanese"),
		h("meta", { charset: "utf-8", }),
		h("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
		h("link", { rel: "icon", href: "/static/img/tga.png" }),
		h("style", {}, csslib()),
		// @ts-ignore
		h("style", {}, css(styles)),
	]),
	h("body", {}, [
		h("main", { class: "vstack g-32" }, [
			h("h1", { class: "c-1" }, kk(["日本語", "勉強"])),
			h("div", { class: "vstack g-32" }, grammar),
		]),
	]),
])
