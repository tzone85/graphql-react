const graphql = require('graphql');

// need to describe our object types here

const {GraphQLObjectType, GraphQLString} = graphql;

const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({
        id: {type: GraphQLString},
        name: {type: GraphQLString},
        genre: {type: GraphQLString}
    })
});