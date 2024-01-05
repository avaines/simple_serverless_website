
import { CognitoAuthProvider } from 'ra-auth-cognito';
import { CognitoUserPool } from 'amazon-cognito-identity-js';

const userPool = new CognitoUserPool({
    UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    ClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
});

export const authProvider = CognitoAuthProvider(userPool);

export const getJwtToken = async () => {
    return new Promise((resolve, reject) => {
        const user = userPool.getCurrentUser();

        if (!user) {
            return reject();
        }

        user.getSession((err, session: CognitoUserSession) => {
            if (err) {
                return reject(err);
            }
            if (!session.isValid()) {
                return reject();
            }
            const token = session.getIdToken().getJwtToken();
            return resolve(token);
        });
    });
};
