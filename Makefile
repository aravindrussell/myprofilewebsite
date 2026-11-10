# Thin wrapper over the npm scripts in package.json (works where `make` is installed).
.PHONY: setup dev build preview test test-api test-e2e lint format typecheck check types

setup:     ; npm run setup
dev:       ; npm run dev
build:     ; npm run build
preview:   ; npm run preview
test:      ; npm run test
test-api:  ; npm run test:api
test-e2e:  ; npm run test:e2e
lint:      ; npm run lint
format:    ; npm run format
typecheck: ; npm run typecheck
types:     ; npm run gen:types
check:     ; npm run check
