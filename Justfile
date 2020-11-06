# wengwengweng

host := "tga@broccoli"

run:
	fserv main.lua

deploy:
	rsync -av --delete --exclude '.DS_Store' . {{host}}:~/space55.xyz
