import { Card, CardContent, CardHeader } from "@mui/material";


export const Dashboard = () => (
    <Card>
        <CardHeader title="Welcome to my simple serverless site starter" />
        <CardContent>
            Built through the <a href="https://marmelab.com/react-admin/Tutorial.html">Marmelab.com</a> tutorial.

            With the <a href="https://github.com/marmelab/ra-auth-cognito">ra-auth-cognito</a> auth provider on top and the data provider replaced with a custom API providing an interface over a DynamoDB table.
        </CardContent>
    </Card>
);
