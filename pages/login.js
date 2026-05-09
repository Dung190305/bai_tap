import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn("credentials", {
      username: credentials.username,
      password: credentials.password,
      callbackUrl: "/", // sau khi đăng nhập chuyển hướng về Dashboard
    });
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Tên đăng nhập</label><br />
          <input
            type="text"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Mật khẩu</label><br />
          <input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <button type="submit" style={{ width: "100%", padding: 10, background: "#667eea", color: "white", border: "none", borderRadius: 5 }}>
          Đăng nhập
        </button>
      </form>
      <div style={{ marginTop: 20, background: "#f5f5f5", padding: 10, fontSize: 14 }}>
        <p><strong>Demo Credentials:</strong></p>
        <p>advisor / 123456 (ROLE_ADVISOR)</p>
        <p>student / 123456 (ROLE_STUDENT)</p>
      </div>
    </div>
  );
}