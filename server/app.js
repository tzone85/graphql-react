const express = require('express');
const schema = require('./schema/schema')

// used as middleware. Used as enpoint to interact with the graphQL data
const graphqlHTTP = require('express-graphql');

const app = express();

// setting up the middleware
app.use('/graphql', graphqlHTTP({
    // es5 schema: schema (es6 just one for both names are the same)
    schema,
    graphiql: true
}));

app.listen(4000, () => {
    console.log('listening to port 4000');
});