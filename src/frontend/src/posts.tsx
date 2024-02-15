import { useRecordContext} from "react-admin";
import {
    List,
    Datagrid,
    TextField,
    ReferenceField,
    EditButton,
    Edit,
    Create,
    SimpleForm,
    ReferenceInput,
    TextInput,
} from "react-admin";


const PostTitle = () => {
  const record = useRecordContext();
  return <span>Post {record ? `"${record.title}"` : ''}</span>;
};

const postFilters = [
    <TextInput key="search" source="q" label="Search" alwaysOn />,
    <ReferenceInput key="user" source="userId" label="User" reference="users" />,
];

export const PostList = () => (
    <List filters={postFilters}>
        {/* <Datagrid rowClick="edit"> */}
        <Datagrid>
            {/* <TextField source="id" /> */}
            <ReferenceField source="userId" reference="users" link="show"/>
            <TextField source="title" />
            <TextField source="body" />
            <EditButton />
        </Datagrid>
    </List>
);

export const PostEdit = () => (
    <Edit title={<PostTitle />}>
        <SimpleForm>
            {/* <TextInput source="id" InputProps={{ disabled: true }} /> */}
            <ReferenceInput source="userId" reference="users" />
            <TextInput source="title" />
            <TextInput source="body" multiline rows={5} />
        </SimpleForm>
    </Edit>
);

export const PostCreate = () => (
    <Create>
    <SimpleForm>
        <ReferenceInput source="userId" reference="users" />
        <TextInput source="title" />
        <TextInput source="body" multiline rows={5} />
    </SimpleForm>
    </Create>
);
