import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';

interface GatewayContext {
  req?: {
    headers?: {
      authorization?: string;
    };
  };
}

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      server: {
        context: ({ req }: { req: unknown }) => ({ req }),
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
        buildService({ url }: { url?: string }) {
          return new RemoteGraphQLDataSource({
            url,
            willSendRequest({
              request,
              context,
            }: {
              request: {
                http?: {
                  headers: { set: (key: string, value: string) => void };
                };
              };
              context: GatewayContext;
            }) {
              const auth = context?.req?.headers?.authorization;
              if (auth) {
                request.http?.headers.set('authorization', auth);
              }
            },
          });
        },
      },
    }),
  ],
})
export class AppModule {}
