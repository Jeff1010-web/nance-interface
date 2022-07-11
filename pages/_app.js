import '../styles/globals.css'
import { GraphQLClient, ClientContext } from 'graphql-hooks'

const client = new GraphQLClient({
  url: 'https://hub.snapshot.org/graphql'
})

function MyApp({ Component, pageProps }) {
  return (
    <ClientContext.Provider value={client}>
      <Component {...pageProps} />;
    </ClientContext.Provider>
  )
}

export default MyApp
