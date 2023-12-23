// import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from "react-admin";
import { Admin, Resource, ShowGuesser } from "react-admin";
import { dataProvider } from "./dataProvider";
import { PostList, PostEdit, PostCreate } from "./posts";
import { UserList } from "./users";
import { Dashboard } from './Dashboard';
// import { authProvider } from './authProvider';

import PostIcon from "@mui/icons-material/Book";
import UserIcon from "@mui/icons-material/Group";


export const App = () => (
  // <Admin authProvider={authProvider} dataProvider={dataProvider} dashboard={Dashboard} >
  <Admin dataProvider={dataProvider} dashboard={Dashboard} >
    <Resource name="posts" list={PostList} edit={PostEdit} create={PostCreate} icon={PostIcon}/>
    <Resource name="users" list={UserList} show={ShowGuesser} recordRepresentation="name" icon={UserIcon} />
  </Admin>
);


