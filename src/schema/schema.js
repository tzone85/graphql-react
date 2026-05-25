import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";

/**
 * Build the GraphQL schema bound to the given Mongoose models.
 * The factory shape lets tests inject in-memory-Mongo-backed models.
 */
export function buildSchema({ Book, Author }) {
  const AuthorType = new GraphQLObjectType({
    name: "Author",
    fields: () => ({
      id: { type: GraphQLID },
      name: { type: GraphQLString },
      age: { type: GraphQLInt },
      books: {
        type: new GraphQLList(BookType),
        resolve: (parent) => Book.find({ authorId: parent.id }),
      },
    }),
  });

  const BookType = new GraphQLObjectType({
    name: "Book",
    fields: () => ({
      id: { type: GraphQLID },
      name: { type: GraphQLString },
      genre: { type: GraphQLString },
      author: {
        type: AuthorType,
        resolve: (parent) => Author.findById(parent.authorId),
      },
    }),
  });

  const RootQuery = new GraphQLObjectType({
    name: "RootQuery",
    fields: {
      book: {
        type: BookType,
        args: { id: { type: new GraphQLNonNull(GraphQLID) } },
        resolve: (_p, { id }) => Book.findById(id),
      },
      books: {
        type: new GraphQLList(BookType),
        resolve: () => Book.find({}),
      },
      author: {
        type: AuthorType,
        args: { id: { type: new GraphQLNonNull(GraphQLID) } },
        resolve: (_p, { id }) => Author.findById(id),
      },
      authors: {
        type: new GraphQLList(AuthorType),
        resolve: () => Author.find({}),
      },
    },
  });

  const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
      addAuthor: {
        type: AuthorType,
        args: {
          name: { type: new GraphQLNonNull(GraphQLString) },
          age: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: async (_p, args) => {
          const doc = await Author.create({ name: args.name, age: args.age });
          return doc.toJSON();
        },
      },
      addBook: {
        type: BookType,
        args: {
          name: { type: new GraphQLNonNull(GraphQLString) },
          genre: { type: new GraphQLNonNull(GraphQLString) },
          authorId: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: async (_p, args) => {
          const doc = await Book.create({
            name: args.name,
            genre: args.genre,
            authorId: args.authorId,
          });
          return doc.toJSON();
        },
      },
      deleteBook: {
        type: BookType,
        args: { id: { type: new GraphQLNonNull(GraphQLID) } },
        resolve: async (_p, { id }) => {
          const doc = await Book.findByIdAndDelete(id);
          return doc ? doc.toJSON() : null;
        },
      },
    },
  });

  return new GraphQLSchema({ query: RootQuery, mutation: Mutation });
}
