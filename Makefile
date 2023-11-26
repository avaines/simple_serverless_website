#!make
SHELL = bash

include .env
export $(shell sed 's/=.*//' .env)

# Dont output action contents (echo/print statements still appear)
.SILENT:

# Load Variables from the sam-output.json file
S3_BUCKET_NAME := $(shell jq -r '.FrontendBucketName' ${ENV_NAME}-${APP_NAME}-sam-outputs.json)

deploy:
	sam deploy -t src/aws/sam/template.yml \
		--stack-name ${ENV_NAME}-${APP_NAME} \
		--s3-bucket ${AWS_SAM_STAGING_BUCKET_NAME} \
		--region ${AWS_REGION} \
		--no-fail-on-empty-changeset \
		--capabilities CAPABILITY_IAM

# Dump and convert the outputs from the SAM CF stack into a key value map which we can use later
	sam list stack-outputs \
		--stack-name ${ENV_NAME}-${APP_NAME} \
		--region ${AWS_REGION} \
		--output json \
		| jq 'reduce .[] as $$item ({}; . + {($$item.OutputKey): $$item.OutputValue})' > ${ENV_NAME}-${APP_NAME}-sam-outputs.json

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

	echo "Uploading bundle to $(S3_BUCKET_NAME)"
	aws s3 cp --region ${AWS_REGION} --recursive src/frontend/build/ s3://$(S3_BUCKET_NAME)
