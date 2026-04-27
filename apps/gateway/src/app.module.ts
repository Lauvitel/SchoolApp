import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      server: {
        context: ({ req }) => ({ req }),
      } as any,
      gateway: {
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            {
              name: 'user',
              url:
                process.env.USER_SERVICE_URL || 'http://localhost:3001/graphql',
            },
            {
              name: 'class',
              url:
                process.env.CLASS_SERVICE_URL ||
                'http://localhost:3002/graphql',
            },
            {
              name: 'grade',
              url:
                process.env.GRADE_SERVICE_URL ||
                'http://localhost:3003/graphql',
            },
          ],
        }),
        buildService({ url }) {
          return new RemoteGraphQLDataSource({
            url,
            willSendRequest({ request, context }) {
              if (context?.req?.headers?.authorization) {
                request.http?.headers.set(
                  'authorization',
                  context.req.headers.authorization,
                );
              }
            },
          });
        },
      },
    }),
  ],
})
export class AppModule {}
