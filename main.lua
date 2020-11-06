-- wengwengweng

local t = httph.tag
local links = string.split(fs.read_text("files/links.txt"), "\n")

local gamedata = {
	{
		name = "好 GOOD",
		year = "2017",
		img = "/img/games/good.png",
		desc = "a game about goodness",
		link = "https://slmjkdbtl.itch.io/good"
	},
	{
		name = "在哪里 wHERE'StIGA",
		year = "2018",
		img = "/img/games/wherestiga.png",
		desc = "finding tiga",
		link = "https://slmjkdbtl.itch.io/wherestiga"
	},
	{
		name = "肮脏的手 DIRTY FINGER",
		year = "2018",
		img = "/img/games/dirtyfinger.png",
		desc = "finger game",
		link = "https://slmjkdbtl.itch.io/dirty-finger"
	},
	{
		name = "大黄鸡的人生觉悟 Big Bird's Question About Life",
		year = "2018",
		img = "/img/games/bigbird.png",
		desc = "bir bird game",
		link = "https://slmjkdbtl.itch.io/bigbirdsquestionaboutlife"
	},
	{
		name = "粉红鱼鱼 Find the Pink Fish",
		year = "2018",
		img = "/img/games/pfish.png",
		desc = "fish game",
		link = "https://slmjkdbtl.itch.io/pfish"
	},
	{
		name = "吃鱼 Eat Fish",
		year = "2018",
		img = "/img/games/eatfish.png",
		desc = "fish eating game",
		link = "https://slmjkdbtl.itch.io/eat-fish"
	},
	{
		name = "角膜 CONJUN",
		year = "2017",
		img = "/img/games/conjun.png",
		desc = "squeeze game",
		link = "https://slmjkdbtl.itch.io/conjun"
	},
	{
		name = "高光 BL00000M",
		year = "2017",
		img = "/img/games/bl00000m.png",
		desc = "flower game",
		link = "https://slmjkdbtl.itch.io/bl00000m"
	},
	{
		name = "丽萨 LISA",
		year = "2018",
		img = "/img/games/lisa.png",
		desc = "tommy tearing apart game",
		link = "https://slmjkdbtl.itch.io/lisa"
	}
}

local sites = {
	{
		name = "instagram",
		link = "https://www.instagram.com/slmjkdbtl/",
	},
	{
		name = "twitter",
		link = "https://twitter.com/slmjkdbtl/",
	},
	{
		name = "github",
		link = "https://github.com/slmjkdbtl/",
	},
	{
		name = "itch.io",
		link = "https://slmjkdbtl.itch.io/",
	},
}

local home = t("html", {}, {
	t("head", {}, {
		t("title", {}, "tga"),
		t("meta", { charset = "utf-8", }),
		t("meta", { name = "viewport", content = "width=device-width, initial-scale=1" }),
		t("link", { rel = "stylesheet", href = "/styles/main.css" }),
	}),
	t("body", {}, {
		t("div", { id = "dino", }, {
			t("img", { id = "body", src = "/img/drawings/dino.png", alt = "dino" }),
			t("img", { id = "flower", src = "/img/drawings/flower1.png", alt = "flower" }),
		}),
		t("img", { id = "title", src = "/img/misc/title.png", alt = "title", }),
		t("div", { class = "games wrapper", }, table.map(gamedata, function(data)
			return t("div", { class = "box", }, {
				t("a", { href = data.link, }, {
					t("img", { class = "img", src = data.img, alt = data.name, })
				})
			})
		end)),
		t("a", { href = "/randomlink", }, {
			t("img", { id = "randomlink", src = "/img/misc/randomlink.png", alt = "random link", }),
		}),
		t("img", { id = "elsewhere", src = "/img/misc/elsewhere.png", alt = "elsewhere", }),
		t("div", { class = "sites wrapper", }, table.map(sites, function(data)
			return t("a", { class = "box", href = data.link, }, {
				t("img", { class = "img", src = string.format("/img/sites/%s.png", data.name), alt = data.name, })
			})
		end)),
		t("script", { src = "/scripts/main.js" }, ""),
	}),
})

function dir(path)
	local list = fs.read_dir(path)
	return t("html", {}, {
		t("head", {}, {
			t("title", {}, path),
			t("meta", { charset = "utf-8", }),
			t("link", { rel = "stylesheet", href = "/styles/dir.css" }),
		}),
		t("body", {}, table.map(list, function(item)
			return t("li", {}, {
				t("a", { href = string.format("%s/%s", path, item), }, item),
			})
		end)),
	})
end

function randomlink(req)
	return {
		status = 307,
		headers = {
			["Location"] = links[math.random(#links)],
		},
	}
end

function no()
	return {
		status = 404,
		body = "no",
	}
end

function printreq(req)
	print(req.method .. " " .. req.target)
	for k, v in pairs(req.headers) do
		print(k .. ": " .. v)
	end
	print("---")
end

local port = os.getenv("PORT") or 80

print("http://localhost:" .. port)

http.serve(port, httph.handlers({
-- 	printreq,
	httph.route("GET", "/", httph.html(home)),
	httph.route("GET", "/favicon.ico", httph.file("img/icon.png")),
	httph.route("GET", "/randomlink", randomlink),
	httph.route("GET", "/files", httph.html(dir("files"))),
	httph.static("."),
	no,
}))

