#!make
SHELL = bash

include .env
export $(shell sed 's/=.*//' .env)

# Dont output action contents (echo/print statements still appear)
.SILENT:

# Load Variables from the sam-output.json file
S3_BUCKET_NAME := $(shell jq -r '.frontend_bucket_name.value' ${ENV_TYPE}-${ENVIRONMENT}-outputs.json)


# Infrastructure
.PHONY: prepare-terraform-backend
prepare-terraform-backend:
	sed -i '' -e '/bucket.*=/ s/= .*/= "${AWS_BUCKET_NAME}"/' ./src/terraform/backend.tf
	sed -i '' -e '/region.*=/ s/= .*/= "${AWS_REGION}"/' ./src/terraform/backend.tf
	sed -i '' -e '/key.*=/ s/= .*/= "${ENV_TYPE}\/${ENVIRONMENT}"/' ./src/terraform/backend.tf

plan:
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

apply:
	$(MAKE) prepare-terraform-backend

	cd ./src/terraform ;\
	terraform init ;\
	terraform apply \
		-compact-warnings \
		-var aws_account_id=${AWS_ACCOUNT_ID} \
		-var aws_region=${AWS_REGION} \
		-var env_type=${ENV_TYPE} \
		-var environment=${ENVIRONMENT} ;\

outputs:
	$(MAKE) prepare-terraform-backend

	cd ./src/terraform ;\
	terraform init ;\
	terraform output -no-color -json > "../../${ENV_TYPE}-${ENVIRONMENT}-outputs.json"

# Frontend
site-run:
	cd src/frontend ; \
	npm install ; \
	npm run dev

site-build:
	cd src/frontend/ ; \
	npm install ; \
	npm run build

site-test:
	cd src/frontend/ ; \
	npm install ; \
	npm test

site-publish:
	echo "Building site bundle"
	$(MAKE) site-build
	$(MAKE) outputs

	echo "Uploading bundle to $(S3_BUCKET_NAME)"
	aws s3 cp --region ${AWS_REGION} --recursive src/frontend/dist/ s3://$(S3_BUCKET_NAME)

# Build the infra, deploy the site in one go
jfdi:
	$(MAKE) apply
	$(MAKE) site-publish
