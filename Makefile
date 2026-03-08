.PHONY: help install backend-install frontend-install build test backend-test frontend-test migrate jwt-keys lint lint-fix php-lint php-fix ts-lint ts-fix stylelint stylelint-fix pipeline dev-backend dev-frontend submodule-init

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: backend-install frontend-install jwt-keys migrate ## Full project setup

backend-install: ## Install PHP dependencies
	composer install --no-interaction

frontend-install: ## Install frontend dependencies
	cd frontend && yarn install --immutable

build: ## Build Angular frontend for production
	cd frontend && yarn ng build --configuration=production

jwt-keys: ## Generate JWT keypair
	mkdir -p config/jwt
	openssl genrsa -out config/jwt/private.pem -aes256 -passout pass:basscloud2026 4096
	openssl rsa -pubout -in config/jwt/private.pem -out config/jwt/public.pem -passin pass:basscloud2026

migrate: ## Run database migrations
	php bin/console doctrine:migrations:migrate --no-interaction

test: backend-test frontend-test ## Run all tests

backend-test: ## Run PHPUnit tests
	php vendor/bin/phpunit

frontend-test: ## Run Jest tests
	cd frontend && yarn jest --passWithNoTests

lint: php-lint ts-lint stylelint ## Run all linters

lint-fix: php-fix ts-fix stylelint-fix ## Run all linters with auto-fix

ts-lint: ## Run ESLint on TypeScript and HTML files
	cd frontend && yarn eslint 'src/**/*.ts' 'src/**/*.html'

ts-fix: ## Fix ESLint issues automatically
	cd frontend && yarn eslint 'src/**/*.ts' 'src/**/*.html' --fix

stylelint: ## Run Stylelint on SCSS files
	cd frontend && yarn stylelint 'src/**/*.scss'

stylelint-fix: ## Fix Stylelint issues automatically
	cd frontend && yarn stylelint 'src/**/*.scss' --fix

pipeline: php-lint ts-lint stylelint backend-test frontend-test ## Run full CI pipeline (all linters + all tests)

php-lint: ## Check PHP code style (dry-run)
	php-cs-fixer/vendor/bin/php-cs-fixer fix --config=.php-cs-fixer.dist.php --allow-risky=yes --dry-run --diff

php-fix: ## Fix PHP code style
	php-cs-fixer/vendor/bin/php-cs-fixer fix --config=.php-cs-fixer.dist.php --allow-risky=yes

dev-backend: ## Start Symfony dev server with 10G upload limit (overrides system 2M default)
	# config/php-ini/upload.ini raises upload_max_filesize and post_max_size to 10G.
	# PHP_INI_SCAN_DIR replaces the system scan dir — our dir is prepended so it wins.
	# On QNAP production, public/.user.ini is read automatically by PHP-FPM.
	PHP_INI_SCAN_DIR="$(CURDIR)/config/php-ini" symfony server:start --port=8000 --no-tls

dev-frontend: ## Start Angular dev server
	cd frontend && yarn ng serve --proxy-config proxy.conf.json --port=4200

submodule-init: ## Initialize git submodules
	git submodule add git@github.com:net-idea/devtools.git .devtools 2>/dev/null || true
	git submodule update --init

check-upload-limit: ## Show current PHP upload limits
	@echo "upload_max_filesize : $$(php -r "echo ini_get('upload_max_filesize');")"
	@echo "post_max_size       : $$(php -r "echo ini_get('post_max_size');")"
	@echo "memory_limit        : $$(php -r "echo ini_get('memory_limit');")"
	@echo ""
	@echo "With dev override (config/php-ini/upload.ini):"
	@PHP_INI_SCAN_DIR="$(CURDIR)/config/php-ini" php -r "echo 'upload_max_filesize : '.ini_get('upload_max_filesize').PHP_EOL.'post_max_size       : '.ini_get('post_max_size').PHP_EOL;"
