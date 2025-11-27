const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginLandingPageLocalDefault } = require('@apollo/server/plugin/landingPage/default');
const mongoose = require('mongoose');
const cors = require('cors');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const mongooseConnectionString = process.env.DB_CONNECTION_STRING || '';

mongoose.connect(mongooseConnectionString, {authSource: 'admin'})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

async function startServer() {
    const app = express();

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: true,
	plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true})],
    });

    app.use(cors());

    await server.start();


    app.use('/graphql', express.json(), expressMiddleware(server, { context: async ({req}) => {
        return {};
    } }));

    app.listen(4000, () => {
        console.log('🚀 Server is running on http://localhost:4000/graphql');
    });
}

startServer();
