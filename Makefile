#!make
SHELL = bash

include .env
export $(shell sed 's/=.*//' .env)

# Dont output action contents (echo/print statements still appear)
.SILENT:

# Load Variables from the sam-output.json file
S3_BUCKET_NAME := $(shell jq -r '.frontend_bucket_name.value' '${ENV_TYPE}-${ENVIRONMENT}-outputs.json')
API_URL := $(shell jq -r '.frontend_cdn.value.cname' '${ENV_TYPE}-${ENVIRONMENT}-outputs.json')
COGNITO_APP_CLIENT_ID := $(shell jq -r '.cognito_app_client_id.value' '${ENV_TYPE}-${ENVIRONMENT}-outputs.json')
COGNITO_USER_POOL_ID := $(shell jq -r '.cognito_user_pool_id.value' '${ENV_TYPE}-${ENVIRONMENT}-outputs.json')
CLOUDFRONT_DIST_ID := $(shell jq -r '.frontend_cdn.value.id' '${ENV_TYPE}-${ENVIRONMENT}-outputs.json')

# Infrastructure
.PHONY: prepare-terraform-backend
prepare-terraform-backend:
	sed -i '' -e '/bucket.*=/ s/= .*/= "${AWS_BUCKET_NAME}"/' ./src/terraform/backend.tf
	sed -i '' -e '/region.*=/ s/= .*/= "${AWS_REGION}"/' ./src/terraform/backend.tf
	sed -i '' -e '/key.*=/ s/= .*/= "${ENV_TYPE}\/${ENVIRONMENT}"/' ./src/terraform/backend.tf

infra-plan:
	$(MAKE) prepare-terraform-backend

	cd ./src/terraform ;\
	terraform init ;\
	terraform fmt ;\
	terraform plan \
		-compact-warnings \
		-var aws_account_id=${AWS_ACCOUNT_ID} \
		-var aws_region="${AWS_REGION}" \
		-var env_type=${ENV_TYPE} \
		-var environment=${ENVIRONMENT}

infra-apply:
	$(MAKE) prepare-terraform-backend

	cd ./src/terraform ;\
	terraform init ;\
	terraform apply \
		-compact-warnings \
		-auto-approve \
		-var aws_account_id=${AWS_ACCOUNT_ID} \
		-var aws_region=${AWS_REGION} \
		-var env_type=${ENV_TYPE} \
		-var environment=${ENVIRONMENT} ;\

infra-outputs:
	$(MAKE) prepare-terraform-backend

	cd ./src/terraform ;\
	terraform init ;\
	terraform output -no-color -json > "../../${ENV_TYPE}-${ENVIRONMENT}-outputs.json"


# Frontend
write-fe-dot-env:
	cd src/frontend ; \
	echo VITE_BACKEND_API_URL="https://${API_URL}/api" > .env; \
	echo VITE_COGNITO_USER_POOL_ID="${COGNITO_USER_POOL_ID}" >> .env; \
	echo VITE_COGNITO_APP_CLIENT_ID="${COGNITO_APP_CLIENT_ID}" >> .env;

site-run:
	$(MAKE) write-fe-dot-env
	cd src/frontend ; \
	npm install ; \
	npm run dev

site-build:
	$(MAKE) write-fe-dot-env
	cd src/frontend/ ; \
	npm install ; \
	npm run build

site-test:
	cd src/frontend/ ; \
	npm install ; \
	npm test

site-publish:
	echo "Building site bundle"
	$(MAKE) infra-outputs
	$(MAKE) site-build

	echo "Uploading bundle to $(S3_BUCKET_NAME)"
	aws s3 cp --region ${AWS_REGION} --recursive src/frontend/dist/ s3://$(S3_BUCKET_NAME)

# dev helpers
database-reset:
	echo "Replacing Posts table"
	python "./src/scripts/dynamodb/loadSampleData/main.py" \
		--empty-first \
		--table $(shell jq -r '.dynamodb_table_names.value.posts' dev-main-outputs.json) \
		--data-path "src/scripts/dynamodb/loadSampleData/example-posts-data.json"

	echo "Replacing Users table"
	python "./src/scripts/dynamodb/loadSampleData/main.py" \
		--empty-first \
		--table $(shell jq -r '.dynamodb_table_names.value.users' dev-main-outputs.json) \
		--data-path "src/scripts/dynamodb/loadSampleData/example-users-data.json"


# Build the infra, deploy the site in one go
jfdi:
	$(MAKE) infra-apply
	$(MAKE) site-publish
	aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DIST_ID} --paths "/*" --no-cli-pager
