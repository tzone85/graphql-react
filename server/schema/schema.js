const graphql = require('graphql');

// need to describe our object types, as well as relationships between types.

const {GraphQLObjectType, GraphQLString, GraphQLSchema} = graphql;

const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({
        id: {type: GraphQLString},
        name: {type: GraphQLString},
        genre: {type: GraphQLString}
    })
});

const RouteQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        book: {
            type: BookType,
            args: {id: {type: GraphQLString}},
            resolve(parent, args){
                // how we get data from db / other source
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RouteQuery
})