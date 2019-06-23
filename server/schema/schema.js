const graphql = require('graphql');
const _ = require('lodash');

// need to describe our object types, as well as relationships between types.

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID
} = graphql;

// dummy data

let books = [
    {name: 'Name of the Wind', genre: 'Fantasy', id: '1'},
    {name: 'Oaklahoma', genre: 'Fantasy', id: '2'},
    {name: 'Umzimba Wam', genre: 'Sci-Fi', id: '3'}
]

const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        genre: {type: GraphQLString}
    })
});

const RouteQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        book: {
            type: BookType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args) {
                // how we get data from db / other source
                return _.find(books, {id: args.id});
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RouteQuery
})