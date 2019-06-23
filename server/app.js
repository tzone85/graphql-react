const express = require('express');

// used as middleware. Used as enpoint to interact with the graphQL data
const graphqlHTTP = require('express-graphql');

const app = express();

// setting up the middleware
app.use('/graphql', graphqlHTTP({

}));

app.listen(4000, () => {
    console.log('listenning to port 4000');
});