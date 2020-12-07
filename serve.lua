-- wengwengweng

-- TODO: cache all images

local t = www.tag
local links = string.split(fs.read("files/links.txt"), "\n")

local gamedata = {
	{
		name = "好 GOOD",
		year = "2017",
		img = "img/games/good.png",
		desc = "a game about goodness",
		link = "https://slmjkdbtl.itch.io/good"
	},
	{
		name = "在哪里 wHERE'StIGA",
		year = "2018",
		img = "img/games/wherestiga.png",
		desc = "finding tiga",
		link = "https://slmjkdbtl.itch.io/wherestiga"
	},
	{
		name = "肮脏的手 DIRTY FINGER",
		year = "2018",
		img = "img/games/dirtyfinger.png",
		desc = "finger game",
		link = "https://slmjkdbtl.itch.io/dirty-finger"
	},
	{
		name = "大黄鸡的人生觉悟 Big Bird's Question About Life",
		year = "2018",
		img = "img/games/bigbird.png",
		desc = "bir bird game",
		link = "https://slmjkdbtl.itch.io/bigbirdsquestionaboutlife"
	},
	{
		name = "粉红鱼鱼 Find the Pink Fish",
		year = "2018",
		img = "img/games/pfish.png",
		desc = "fish game",
		link = "https://slmjkdbtl.itch.io/pfish"
	},
	{
		name = "吃鱼 Eat Fish",
		year = "2018",
		img = "img/games/eatfish.png",
		desc = "fish eating game",
		link = "https://slmjkdbtl.itch.io/eat-fish"
	},
	{
		name = "角膜 CONJUN",
		year = "2017",
		img = "img/games/conjun.png",
		desc = "squeeze game",
		link = "https://slmjkdbtl.itch.io/conjun"
	},
	{
		name = "高光 BL00000M",
		year = "2017",
		img = "img/games/bl00000m.png",
		desc = "flower game",
		link = "https://slmjkdbtl.itch.io/bl00000m"
	},
	{
		name = "丽萨 LISA",
		year = "2018",
		img = "img/games/lisa.png",
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

local styles = {

	["*"] = {
		["margin"] = "0",
		["padding"] = "0",
		["box-sizing"] = "border-box",
		["user-select"] = "none",
		["cursor"] = "url(" .. www.base64("img/cursors/1.png") .. "), default",
	},

	[".obj"] = {
		[":hover"] = {
			["cursor"] = "url(" .. www.base64("img/cursors/2.png") .. "), pointer",
		},
	},

	["a"] = {
		["outline"] = "0",
		[":hover"] = {
			["cursor"] = "url(" .. www.base64("img/cursors/2.png") .. "), pointer",
		},
	},

	["html"] = {
		["width"] = "100%",
	},

	["body"] = {
		["width"] = "100%",
		["background"] = "#000000",
		["text-align"] = "center",
	},

	[".box"] = {

		["height"] = "auto",

		[".img"] = {
			["width"] = "100%",
			["height"] = "auto",
			["transition"] = "0.5s",
			[":hover"] = {
				["transform"] = "scale(0.9)",
			},
		},

	},

	["#dino"] = {

		["position"] = "relative",
		["width"] = "64%",
		["margin"] = "0 auto",

		["@media"] = {
			["screen and (max-width: 960px)"] = {
				["width"] = "84%",
				["height"] = "calc(84% * .75)",
			},
			["screen and (max-width: 640px)"] = {
				["width"] = "100%",
				["height"] = "calc(96% * .75)",
				["margin-top"] = "24px",
			},
		},

		["#body"] = {
			["width"] = "100%",
			["height"] = "auto",
		},

		["#flower"] = {

			["position"] = "absolute",
			["top"] = "11%",
			["left"] = "31%",
			["width"] = "10%",
			["height"] = "auto",
			["content"] = "url(" .. www.base64("img/drawings/flower1.png") .. ")",

			["&.happy"] = {
				["animation"] = "happy 0.5s infinite",
			},

		},

	},

	["#title"] = {

		["display"] = "block",
		["width"] = "32%",
		["height"] = "auto",
		["margin"] = "32px auto",
		["padding"] = "1px",

		["@media"] = {
			["screen and (max-width: 960px)"] = {
				["width"] = "48%",
			},
			["screen and (max-width: 640px)"] = {
				["width"] = "72%",
			},
		},

	},

	[".wrapper"] = {

		["width"] = "80%",
		["margin"] = "24px auto",
		["display"] = "flex",
		["justify-content"] = "space-between",
		["flex-wrap"] = "wrap",

		["&.games"] = {

			[".box"] = {

				["width"] = "33%",

				["@media"] = {
					["screen and (max-width: 960px)"] = {
						["width"] = "45%",
					},
					["screen and (max-width: 640px)"] = {
						["width"] = "100%",
					},
				},
			},

		},

		["&.sites"] = {

			[".box"] = {

				["width"] = "25%",

				["@media"] = {
					["screen and (max-width: 640px)"] = {
						["width"] = "100%",
					},
				},

			},

		},

		["@media"] = {
			["screen and (max-width: 640px)"] = {
				["margin-top"] = "-32px",
			},
		},

	},

	["#randomlink"] = {

		["display"] = "block",
		["width"] = "36%",
		["height"] = "auto",
		["margin"] = "0 auto",
		["transition"] = "0.25s",

		["@media"] = {
			["screen and (max-width: 960px)"] = {
				["width"] = "64%",
			},
			["screen and (max-width: 640px)"] = {
				["width"] = "84%",
			},
		},

		[":hover"] = {
			["transform"] = "scale(1.05)",
		},

	},

	["#elsewhere"] = {

		["display"] = "block",
		["width"] = "54%",
		["height"] = "auto",
		["margin-top"] = "48px",
		["margin-left"] = "8%",
		["transition"] = "0.25s",

		["@media"] = {
			["screen and (max-width: 960px)"] = {
				["width"] = "64%",
			},
			["screen and (max-width: 640px)"] = {
				["width"] = "84%",
			},
		},

	},

	["@keyframes"] = {

		["happy"] = {
			["0%"] = {
				["content"] = "url(" .. www.base64("img/drawings/flower1.png") .. ")",
			},
			["25%"] = {
				["content"] = "url(" .. www.base64("img/drawings/flower2.png") .. ")",
			},
			["50%"] = {
				["content"] = "url(" .. www.base64("img/drawings/flower3.png") .. ")",
			},
			["75%"] = {
				["content"] = "url(" .. www.base64("img/drawings/flower4.png") .. ")",
			},
			["100%"] = {
				["content"] = "url(" .. www.base64("img/drawings/flower1.png") .. ")",
			},
		},

	},

}

local home = t("html", {}, {
	t("head", {}, {
		t("title", {}, "tga"),
		t("meta", { charset = "utf-8", }),
		t("meta", { name = "description", content = "tga's homepage", }),
		t("meta", { name = "viewport", content = "width=device-width, initial-scale=1" }),
		t("style", {}, www.styles(styles)),
	}),
	t("body", {}, {
		t("div", { id = "dino", }, {
			t("img", { id = "body", src = www.base64("img/drawings/dino.png"), alt = "dino" }),
			t("img", { id = "flower", class = "obj", alt = "flower" }),
		}),
		t("img", { id = "title", src = www.base64("img/misc/title.png"), alt = "title", }),
		t("div", { class = "games wrapper", }, table.map(gamedata, function(data)
			return t("a", { class = "box obj", href = data.link }, {
				t("img", { class = "img obj", src = www.base64(data.img), alt = data.name, })
			})
		end)),
		t("a", { href = "/randomlink", }, {
			t("img", { id = "randomlink", class = "obj", src = www.base64("img/misc/randomlink.png"), alt = "random link", }),
		}),
		t("img", { id = "elsewhere", src = www.base64("img/misc/elsewhere.png"), alt = "elsewhere", }),
		t("div", { class = "sites wrapper", }, table.map(sites, function(data)
			return t("a", { class = "box obj", href = data.link, }, {
				t("img", { class = "img obj", src = www.base64("img/sites/" .. data.name .. ".png"), alt = data.name, })
			})
		end)),
		t("script", {}, fs.read("scripts/main.js")),
	}),
})

function no()
	return {
		status = 404,
		body = "no",
	}
end

return function(req)

	if req.headers["User-Agent"] and string.match(req.headers["User-Agent"], "curl") then
		return {
			status = 200,
			body = "oh hi!\n",
		}
	end

	if req.method ~= "GET" then
		return no()
	end

	if req.target == "/favicon.ico" then
		return www.file("img/icon.png")
	end

	if req.target == "/" then
		return www.html(home)
	end

	if req.target == "/randomlink" then
		return www.redirect(links[math.random(#links)])
	end

	if req.target == "/diary" then
		return www.dir("diary")
	end

	if req.target:match("^/diary") then
		local entry = req.target:gsub("^/diary/", "")
		if entry then
			return {
				status = 200,
				headers = {
					["Content-Type"] = "text/plain; charset=utf-8",
				},
				body = fs.read("diary/" .. entry)
			}
		else
			return www.dir("diary")
		end
	end

	if req.target == "/dirty" then
		return www.redirect("https://github.com/slmjkdbtl/dirty")
	end

	if req.target == "/fserv" then
		return www.redirect("https://github.com/slmjkdbtl/fserv")
	end

	local path = req.target:sub(2, #req.target)

	if (fs.is_file(path)) then
		return www.file(path)
	end

	return no()

end

