rsync \
	-av \
	--delete \
	--exclude '.DS_Store' \
	--exclude '.git' \
	. \
	tga@babykale:~/space55.xyz

ssh -t tga@babykale sudo systemctl restart space55.xyz
