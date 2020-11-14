# wengwengweng

host := "tga@broccoli"
dest := "~/space55.xyz"

run:
	fserv main.lua

deploy:
	rsync \
		-av \
		--delete \
		--exclude '.DS_Store' \
		--exclude '.git' \
		. \
		{{host}}:{{dest}}

