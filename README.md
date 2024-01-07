# A simple serverless webapp

A basic CRUD webapp deployed using a SAM template; A Javascript frontend with an API backend and DynamoDB data store


## Auth notes
1. Create a user in the cognito pool
2. Set the password for the new user like
`aws cognito-idp admin-set-user-password \
     --user-pool-id ${userPoolId} \
     --username "${username}" \
     --password "${password}" \
     --permanent`
3. Get the Bearer token
`curl --location --request POST 'https://cognito-idp.${aws_region}.amazonaws.com' \
--header 'X-Amz-Target: AWSCognitoIdentityProviderService.InitiateAuth' \
--header 'Content-Type: application/x-amz-json-1.1' \
--data-raw '{
   "AuthParameters" : {
      "USERNAME" : "${user created in step 1}",
      "PASSWORD" : "${user created in step 1}",
   },
   "AuthFlow" : "USER_PASSWORD_AUTH",
   "ClientId" : "${terraform output cognito_user_pool_id}"
}'`
4. Call the API
curl --request GET 'https://${terraform output frontend_cdn_cname}/api/${endpoint}' --header 'Authorization: Bearer ${output AuthenticationResult.AccessToken from step 3}'
