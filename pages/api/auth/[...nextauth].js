import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import spotifyApi, {LOGIN_URL} from "../../../lib/spotify";

async function refreshAccessToken(token) {
  try {
    spotifyApi.setAccessToken(token.accessToken);
    spotifyApi.setRefreshToken(token.refreshToken);

    const {body: refreshedToken } = await spotifyApi.refreshAccessToken();
    console.log("REFRESHED TOKEN IS",refreshedToken);

    return {
      ...token,
      accessToken: refreshedToken.access_token,
      //=1 hour as spotify api return 3600
      accessTokenExpires: Date.now() + refreshedToken.expires_in * 1000,
      //if spotify returns refresh token use it or use other one
      refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
    };

  }catch(erorr){
      console.error(error);

      return {
        ...token,
        error: "RefreshAccessTokenError",
      };
  }
}

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
      authorization:LOGIN_URL,
    }),
    // ...add more providers here
  ],
  secret: process.env.JWT_SECRET,//encrypt JWT token
  pages: {
      signIn: '/login'
  },
  callbacks: {
    async jwt({token,account,user}){
      //initial sign in - First sign in 
      if(account && user){
        return {
        ...token,
        accessToken:account.access_token,
        refreshToken: account.refresh_token,
        username:account.providerAccountId,
        //handling expiry token in milliseconds so times 1000
        //when login token expires_at
        accessTokenExpires:account.expires_at * 1000

        }
      }

      //return previous token is access token is not expired yet
      if(Date.now() < token.accessTokenExpires){
        console.log("EXISTING ACCESS TOKEN IS VALID");
        return token;
      }

      //if access token expires, then we need to refresh the 
        console.log("ACCESS TOKEN HAS EXPIRED , REFRESHING ...");
        return await refreshAccessToken(token);
      
    },

    async session ({session,token}){
      //users client session 
      session.user.accessToken = token.accessToken;
      session.user.refreshToken = token.refreshToken;
      session.user.username = token.username;

      return session;
    }
  },
});
