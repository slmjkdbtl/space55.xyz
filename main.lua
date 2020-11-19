-- wengwengweng

local port = os.getenv("PORT") or 80

print("http://localhost:" .. port)

http.serve(port, function(req)
	return require("server")(req)
end)

