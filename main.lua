-- wengwengweng

local port = os.getenv("PORT") or 80

print("http://localhost:" .. port)

http.serve(port, function(req)
	return dofile("serve.lua")(req)
end)

