/**
 * Meet HaSammie Suah — Frontend
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql';

const httpLink = createHttpLink({ uri: API_URL });

const authLink = setContext((_, { headers }) => {
  const token = sessionStorage.getItem('sammie_token');
  return {
    headers: { ...headers, authorization: token ? `Bearer ${token}` : '' },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }: any) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }: any) => {
      if (message === 'Unauthorized — admin access required') {
        sessionStorage.removeItem('sammie_token');
        sessionStorage.removeItem('sammie_admin');
        window.location.href = '/admin';
      }
    });
  }
  if (networkError) console.error('Network error:', networkError);
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          gallery: { merge: false },
          events:  { merge: false },
          stats:   { merge: false },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
    query:      { fetchPolicy: 'network-only' },
  },
});
