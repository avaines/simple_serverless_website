import { Admin, Resource, ShowGuesser } from "react-admin";
import { dataProvider } from "./dataProvider";
import { PostList, PostEdit, PostCreate } from "./posts";
import { UserList } from "./users";
import { Dashboard } from './Dashboard';
import { CognitoAuthProvider, Login } from 'ra-auth-cognito';
import { CognitoUserPool } from 'amazon-cognito-identity-js';

import PostIcon from "@mui/icons-material/Book";
import UserIcon from "@mui/icons-material/Group";

const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
});

const authProvider = CognitoAuthProvider(userPool);

export const App = () => (
  <Admin authProvider={authProvider} dataProvider={dataProvider} dashboard={Dashboard} loginPage={Login} >
    <Resource name="posts" list={PostList} edit={PostEdit} create={PostCreate} icon={PostIcon}/>
    <Resource name="users" list={UserList} show={ShowGuesser} recordRepresentation="name" icon={UserIcon} />
  </Admin>
);
