# wengwengweng

host := "tga@broccoli"
dest := "~/space55.xyz"
service := "sites"

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
	# this fails for some reason
# 	ssh -t {{host}} 'sudo service {{service}} restart'

