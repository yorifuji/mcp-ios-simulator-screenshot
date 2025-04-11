.PHONY: help build version-patch version-minor version-major login publish publish-patch publish-minor publish-major

# Default target
help:
	@echo "Available commands:"
	@echo "  make help          - Display this help message"
	@echo "  make build         - Build TypeScript"
	@echo "  make version-patch - Update patch version (1.1.0 → 1.1.1)"
	@echo "  make version-minor - Update minor version (1.1.0 → 1.2.0)"
	@echo "  make version-major - Update major version (1.1.0 → 2.0.0)"
	@echo "  make login         - Login to npm"
	@echo "  make publish       - Publish current version to npm"
	@echo "  make publish-patch - Update patch version and publish"
	@echo "  make publish-minor - Update minor version and publish"
	@echo "  make publish-major - Update major version and publish"

# Build
build:
	npm run build

# Version updates
version-patch:
	npm version patch

version-minor:
	npm version minor

version-major:
	npm version major

# npm login
login:
	npm login

# Publish
publish:
	npm publish

# Combined version update and publish commands
publish-patch: version-patch publish

publish-minor: version-minor publish

publish-major: version-major publish