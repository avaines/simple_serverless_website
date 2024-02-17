# A simple serverless webapp
Most projects I want to start need a CRUD for some part of it. Rather than building one every time I've tried to create a simple base to start from that I can use for future projects.

My initial forey in to learning React started with this tutorial from [Marmelab.com](https://marmelab.com/react-admin/Tutorial.html) and then adding the `ra-auth-cognito` auth provider ontop.

Everything is configured in a way that it should just slot in to a really basic CI/CD workflow with minimal fuss, the starting point is a makefile which allows single commands to run most of what you'd need to get started. 
Full instructions in the README.md for the repo.

A basic CRUD webapp deployed using Terraform, with NodeJS functions and a DynamoDB backend database, the frontend is served through an S3 bucket, all presented through a Cloudfront distribution. User authentication is provisioned through AWS's Cognito service.

![In action](./assets/inAction.gif)


## ToDo:
- The authentication is all or nothing currently, there are no scopes or working permission tiers which I'll want to look at later
- The base functions for the API done have any tests, my javascript isn't particularly good currently so as I learn more i'll revisit this.


# Setup
### Requirements
- Terraform 1.6+
- NPM (For building the frontend packages)
- Python3.11+ (for the scripts to load the database with sample data)
- JQ


From a terminal with appropriate AWS access...
## Setup
### Deploy AWS resources
- Create an S3 bucket in your AWS account for storing Terraform's state
- Create a `.env` file in the root of the repo with the following entries:
```
   AWS_BUCKET_NAME=<YOUR TF STATE BUCKETS NAME>
   AWS_ACCOUNT_ID=<YOUR AWS ACCOUNT ID>
   AWS_REGION_NAME=us-east-1
   ENVIRONMENT=main
   ENV_TYPE=dev
```
- Run `make infra-plan` to plan out the AWS resources with Terraform
- Run `make infra-apply` to deploy the AWS resources with Terraform
- Run `make site-build` to package up the React frontend site
- Run `make site-publish` to deploy the packaged React frontend site to the S3 bucket Terraform provisioned

**Other Useful Things**
- Running `make database-reset` will empty and insert some sample data in the DynamooDB tables. THIS WILL DESTROY ALL DATA IN THE TABLES.
- Running `make jfdi` will run the Terraform apply process and pack then deploy the front end before creating an invalidation on the Cloudfront Distribution clearing any caching. 
*(I think if you run this without having the infrastructure already deployed there will be a race condition where some variables read from the Terraform Outputs won't exist and the site will fail to upload. If this happens just run it twice.)*

## Setting up a user to access the website
1. Create a user in the cognito pool
2. Set the password for the new user like:
`aws cognito-idp admin-set-user-password \
     --user-pool-id ${userPoolId} \
     --username "${username}" \
     --password "${password}" \
     --permanent`

## Manally calling the API, without going through the Frontend site
1. Generate a Bearer Token
   - Option 1: Manually
      - Get the Bearer token
      ```
      curl --location --request POST 'https://cognito-idp.${aws_region}.amazonaws.com' \
      --header 'X-Amz-Target: AWSCognitoIdentityProviderService.InitiateAuth' \
      --header 'Content-Type: application/x-amz-json-1.1' \
      --data-raw '{
         "AuthParameters" : {
            "USERNAME" : "${user created in step 1}",
            "PASSWORD" : "${user created in step 1}",
         },
         "AuthFlow" : "USER_PASSWORD_AUTH",
         "ClientId" : "${terraform output cognito_user_pool_id}"
      }'
      ```

   - Option 2: Script
      - Use the script in this repo to do this like:
      `./src/scripts/cognito/cognito_bearer.sh "COGNITO_APP_CLIENT_ID" "USERNAME" "PASSWORD" | jq -r '.AuthenticationResult.AccessToken'`

2. Call the API
curl --request GET 'https://${Terraform frontend_cdn.cname}/api/${endpoint}' --header 'Authorization: Bearer ${Bearer Token}'
