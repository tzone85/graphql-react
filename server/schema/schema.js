const graphql = require('graphql');
const _ = require('lodash');

// need to describe our object types, as well as relationships between types.

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt
} = graphql;

// dummy data

let books = [
    {name: 'Name of the Wind', genre: 'Fantasy', id: '1'},
    {name: 'Oaklahoma', genre: 'Fantasy', id: '2'},
    {name: 'Umzimba Wam', genre: 'Sci-Fi', id: '3'}
];

let authors = [
    {name: 'Patrick Mini', age: 40, id: 1},
    {name: 'Mcedi Mini', age: 42, id: 2},
    {name: 'Thando Sombolo', age: 36, id: 3}
];

const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        genre: {type: GraphQLString}
    })
});

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        age: {type: GraphQLInt}
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
        },

        author: {
            type: AuthorType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args) {
                // find author based on the provided id
                console.log('ndiyafika');
                return _.find(authors, {id: args.id});
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RouteQuery
});