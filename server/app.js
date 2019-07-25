const express = require('express');
const schema = require('./schema/schema');

// used as middleware. Used as enpoint to interact with the graphQL data
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');

const app = express();

// connect to mongodb database
mongoose.connect('mongodb://root:example@localhost:27017/admin', { useNewUrlParser: true }).then(() => { console.log('connected to db')});

// mongoose.connection.once('open', () => {
//     console.log('connected to database');
// });

var books = new mongoose.Schema({name: 'string', genre: 'string', id: 'number', authorid: 'string'});
var Book = mongoose.model('Books', books);


var small = new Book({ size: 'small' });
// small.save(function (err) {
//     if (err) return handleError(err);
//     // saved!
// });
//
// // or
//
// Tank.create({ size: 'small' }, function (err, small) {
//     if (err) return handleError(err);
//     // saved!
// });

// or, for inserting large batches of documents
Book.insertMany([
    {name: 'Name of the Wind', genre: 'Fantasy', id: '1', authorid: '1'},
    {name: 'Oaklahoma', genre: 'Fantasy', id: '2', authorid: '2'},
    {name: 'Umzimba Wam', genre: 'Sci-Fi', id: '3', authorid: '3'},
    {name: 'Redeeming Love', genre: 'Romance', id: '4', authorid: '2'},
    {name: 'Encyclopedia', genre: 'Reference', id: '5', authorid: '3'},
    {name: 'Thando Mini Chronicles', genre: 'Auto Biography', id: '6', authorid: '3'}
], function(err) {

});

// setting up the middleware
app.use('/graphql', graphqlHTTP({
    // es5 schema: schema (es6 just one for both names are the same)
    schema,
    graphiql: true
}));

app.listen(4000, () => {
    console.log('listening to port 4000');
});