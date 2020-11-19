-- wengwengweng

local links = string.split(fs.read_text("files/links.txt"), "\n")

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

return function(req)

	if string.match(req.headers["User-Agent"], "curl") then
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
		return www.html(dofile("homepage.lua"))
	end

	if req.target == "/randomlink" then
		return randomlink()
	end

	if req.target == "/files" then
		return www.dir("files")
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

