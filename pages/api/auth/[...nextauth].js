import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Giả lập backend
const fakeBackend = {
  login(credentials) {
    // Kiểm tra thông tin
    if (credentials.username === "advisor" && credentials.password === "123456") {
      return {
        id: 1,
        name: "Advisor User",
        role: "ROLE_ADVISOR",
        accessToken: "access_token_" + Math.random().toString(36).substr(2, 8),
        accessTokenExpiresIn: 60, // giây
        refreshToken: "refresh_token_" + Math.random().toString(36).substr(2, 8),
      };
    }
    if (credentials.username === "student" && credentials.password === "123456") {
      return {
        id: 2,
        name: "Student User",
        role: "ROLE_STUDENT",
        accessToken: "access_token_" + Math.random().toString(36).substr(2, 8),
        accessTokenExpiresIn: 60,
        refreshToken: "refresh_token_" + Math.random().toString(36).substr(2, 8),
      };
    }
    return null;
  },

  refreshAccessToken(refreshToken) {
    // Giả lập refresh - luôn thành công
    return {
      accessToken: "new_access_token_" + Math.random().toString(36).substr(2, 8),
      accessTokenExpiresIn: 60,
      refreshToken: refreshToken, // có thể trả về refreshToken mới hoặc giữ nguyên
    };
  },
};

async function refreshAccessToken(token) {
  try {
    const refreshedTokens = fakeBackend.refreshAccessToken(token.refreshToken);
    return {
      ...token,
      accessToken: refreshedTokens.accessToken,
      accessTokenExpires: Date.now() + refreshedTokens.accessTokenExpiresIn * 1000,
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken, // fallback token cũ nếu backend không trả
    };
  } catch (error) {
    console.error("Refresh token failed", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = fakeBackend.login(credentials);
        if (user) {
          return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Lần đầu đăng nhập: user có dữ liệu từ authorize
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.accessTokenExpires = Date.now() + user.accessTokenExpiresIn * 1000;
        token.refreshToken = user.refreshToken;
      }

      // Kiểm tra xem token đã hết hạn chưa
      const shouldRefreshTime = token.accessTokenExpires - Date.now();
      if (shouldRefreshTime > 0) {
        // Token còn hạn, trả về luôn
        return token;
      }

      // Token hết hạn -> refresh
      console.log("Token hết hạn, đang refresh...");
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      // Đưa thông tin từ token vào session để client dùng
      session.user.id = token.id;
      session.user.role = token.role;
      session.accessToken = token.accessToken;
      session.accessTokenExpires = token.accessTokenExpires;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: "your-secret-key-change-me", // nên dùng biến môi trường
});