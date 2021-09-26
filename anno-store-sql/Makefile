PATH := ./node_modules/.bin:$(PATH)

TMP_DIR := test.tmp
DB_FILE := ${TMP_DIR}/example.sqlite3

# Migrate to latest schema
start:
	mkdir --parents -- "${TMP_DIR}"
	[ ! -e "${DB_FILE}" ] || rm -- "${DB_FILE}"
	DB_FILE="${DB_FILE}" ./node_modules/.bin/knex migrate:latest
