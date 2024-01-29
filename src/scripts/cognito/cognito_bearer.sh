COGNITO_CLIENT_ID="${1}"
USERNAME="${2}"
PASSWORD="${3}"

DATA_BLOB=$(jq --null-input \
               --arg cogclientid "${COGNITO_CLIENT_ID}" \
               --arg username ${USERNAME} \
               --arg password ${PASSWORD} \
               '{
               "AuthParameters" : {
                  "USERNAME" : $username,
                  "PASSWORD" : $password,
               },
               "AuthFlow" : "USER_PASSWORD_AUTH",
               "ClientId" : $cogclientid
            }'
         )

curl --silent --location --request POST "https://cognito-idp.${AWS_REGION}.amazonaws.com" \
--header 'X-Amz-Target: AWSCognitoIdentityProviderService.InitiateAuth' \
--header 'Content-Type: application/x-amz-json-1.1' \
--data-raw "${DATA_BLOB}"

