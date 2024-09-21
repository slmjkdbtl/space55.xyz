DEPLOY_HOST = tga@space55.xyz
DEPLOY_DIR = /home/tga/space55.xyz
DEPLOY_SERVICE = space55.xyz
FONT_TARGETS = static/fonts/NotoSerifJP.woff2

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

.PHONY: fonts
fonts: $(FONT_TARGETS)

static/fonts/NotoSerifJP.woff2: static/fonts/NotoSerifJP.ttf jap.ts
	pyftsubset "$<" \
		--text-file="$(wordlist 2,64,$^)" \
		--flavor=woff2 \
		--output-file="$@"

.PHONY: clean
clean:
	rm $(FONT_TARGETS)
