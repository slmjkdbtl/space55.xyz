DEPLOY_HOST = tga@space55.xyz
DEPLOY_DIR = /home/tga/space55.xyz
DEPLOY_SERVICE = space55.xyz

.PHONY: dev
dev:
	DEV=1 bun run --watch main.ts

.PHONY: start
start:
	bun run main.ts

.PHONY: deploy
deploy:
	rsync \
		-av --delete \
		--exclude .DS_Store \
		--exclude .git \
		--exclude .env \
		--exclude data \
		--exclude node_modules \
		. $(DEPLOY_HOST):$(DEPLOY_DIR)
	ssh -t $(DEPLOY_HOST) "sudo systemctl restart $(DEPLOY_SERVICE)"

.PHONY: status
status:
	ssh -t $(DEPLOY_HOST) "sudo systemctl status $(DEPLOY_SERVICE)"

.PHONY: check
check:
	bunx tsc

.PHONY: links
links:
	bun run scripts/links.ts
