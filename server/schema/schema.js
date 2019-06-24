const graphql = require('graphql');
const _ = require('lodash');

// need to describe our object types, as well as relationships between types.

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList
} = graphql;

// dummy data

let books = [
    {name: 'Name of the Wind', genre: 'Fantasy', id: '1', authorid: '1'},
    {name: 'Oaklahoma', genre: 'Fantasy', id: '2', authorid: '2'},
    {name: 'Umzimba Wam', genre: 'Sci-Fi', id: '3', authorid: '3'},
    {name: 'Redeeming Love', genre: 'Romance', id: '4', authorid: '2'},
    {name: 'Encyclopedia', genre: 'Reference', id: '5', authorid: '3'},
    {name: 'Thando Mini Chronicles', genre: 'Auto Biography', id: '6', authorid: '3'}
];

let authors = [
    {name: 'Patrick Mini', age: 40, id: '1'},
    {name: 'Mcedi Mini', age: 42, id: '2'},
    {name: 'Thando Sombolo', age: 36, id: '3'},
];

const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        genre: {type: GraphQLString},

        // relation book to author
        author: {
            type: AuthorType,
            resolve(parent, args){
                console.log('parent', parent);
                return _.find(authors, {id: parent.authorid});
            }
        }
    })
});

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        age: {type: GraphQLInt},

        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args) {
                return _.filter(books,{authorid: parent.id});
            }
        }
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
                return _.find(authors, {id: args.id});
            }
        },

        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args){
                return books
            }
        },

        authors: {
            type: new GraphQLList(AuthorType),
            resolve(parent, args) {
                return authors;
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RouteQuery
});