import { inject } from '@angular/core';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { HttpHeaders } from '@angular/common/http';
import { TokenService } from '../auth/token.service';
import { environment } from '../../../environments/environment';

export function apolloProviderFactory() {
  const httpLink = inject(HttpLink);
  const tokenService = inject(TokenService);

  const http = httpLink.create({ uri: environment.graphqlUri });

  const auth = new ApolloLink((operation, forward) => {
    const token = tokenService.getToken();
    if (token) {
      operation.setContext({
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
        }),
      });
    }
    return forward(operation);
  });

  return {
    link: ApolloLink.from([auth, http]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only' as const,
      },
    },
  };
}
