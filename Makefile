#!make
SHELL = bash

include .env
export $(shell sed 's/=.*//' .env)

# Dont output action contents (echo/print statements still appear)
.SILENT:

# Load Variables from the sam-output.json file
S3_BUCKET_NAME := $(shell jq -r '.frontend_bucket_name.value' ${ENV_TYPE}-${ENVIRONMENT}-outputs.json)

# Infrastructure
# deploy:
# 	sam deploy -t src/aws/sam/template.yml \
# 		--stack-name ${ENV_NAME}-${APP_NAME} \
# 		--s3-bucket ${AWS_BUCKET_NAME} \
# 		--region ${AWS_REGION} \
# 		--no-fail-on-empty-changeset \
# 		--capabilities CAPABILITY_IAM

# # Dump and convert the outputs from the SAM CF stack into a key value map which we can use later
# 	sam list stack-outputs \
# 		--stack-name ${ENV_NAME}-${APP_NAME} \
# 		--region ${AWS_REGION} \
# 		--output json \
# 		| jq 'reduce .[] as $$item ({}; . + {($$item.OutputKey): $$item.OutputValue})' > ${ENV_NAME}-${APP_NAME}-sam-outputs.json

# validate:
# 	sam validate -t src/aws/sam/template.yml \
# 		--region ${AWS_REGION} \
# 		--lint


plan:
	sed -i '' -e '/bucket =/ s/= .*/= "${AWS_BUCKET_NAME}"/' ./src/terraform/backend.tf
	sed -i '' -e '/region =/ s/= .*/= "${AWS_REGION}"/' ./src/terraform/backend.tf
	sed -i '' -e '/key =/ s/= .*/= "${ENV_TYPE}\/${ENVIRONMENT}"/' ./src/terraform/backend.tf

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
	cd ./src/terraform ;\
	terraform init ;\
	terraform apply \
		-compact-warnings \
		-var aws_account_id=${AWS_ACCOUNT_ID} \
		-var aws_region=${AWS_REGION} \
		-var env_type=${ENV_TYPE} \
		-var environment=${ENVIRONMENT} ;\

outputs:
	sed -i '' -e '/bucket =/ s/= .*/= "${AWS_BUCKET_NAME}"/' ./src/terraform/backend.tf
	sed -i '' -e '/region =/ s/= .*/= "${AWS_REGION}"/' ./src/terraform/backend.tf
	sed -i '' -e '/key =/ s/= .*/= "${ENV_TYPE}\/${ENVIRONMENT}"/' ./src/terraform/backend.tf

	cd ./src/terraform ;\
	terraform init ;\
	terraform output -no-color -json > "../../${ENV_TYPE}-${ENVIRONMENT}-outputs.json"

# Frontend
site-run:
	cd src/frontend ; \
	npm install ; \
	npm start

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
	aws s3 cp --region ${AWS_REGION} --recursive src/frontend/build/ s3://$(S3_BUCKET_NAME)

# Build the infra, deploy the site in one go
jfdi:
	$(MAKE) apply
	$(MAKE) site-publish
