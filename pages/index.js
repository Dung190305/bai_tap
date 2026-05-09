import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Tính thời gian còn lại của token (hiển thị)
  const tokenExpiresIn = session?.accessTokenExpires
    ? Math.max(0, Math.floor((session.accessTokenExpires - Date.now()) / 1000))
    : 0;

  if (status === "loading") return <p>Loading...</p>;

  // Chưa đăng nhập -> chuyển hướng về login (có thể dùng middleware hoặc getServerSideProps)
  if (!session) {
    // NextAuth tự động redirect nếu dùng middleware, nhưng ta dùng client-side redirect
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  // Kiểm tra role
  if (session.user.role !== "ROLE_ADVISOR") {
    return (
      <div style={{ maxWidth: 400, margin: "100px auto", padding: 20, border: "1px solid #d32f2f", borderRadius: 8, textAlign: "center" }}>
        <div style={{ fontSize: 48, color: "#d32f2f" }}>❌</div>
        <h3 style={{ color: "#d32f2f" }}>Bị Từ Chối Truy Cập</h3>
        <p>Bạn không có quyền truy cập trang này. Chỉ Cố Vấn (ROLE_ADVISOR) mới được phép.</p>
        <div style={{ background: "#fce4ec", padding: 10, borderRadius: 5, margin: "10px 0" }}>
          Role của bạn: {session.user.role}
        </div>
        <button onClick={() => signOut()} style={{ padding: 10, background: "#d32f2f", color: "white", border: "none", borderRadius: 5, cursor: "pointer", width: "100%" }}>
          Đăng Xuất
        </button>
      </div>
    );
  }

  // Hàm gọi API giả lập (sử dụng accessToken từ session)
  const fetchClasses = async () => {
    setLoading(true);
    try {
      // Trong thực tế bạn sẽ gọi API backend với header Authorization: Bearer session.accessToken
      // Ở đây mô phỏng bằng cách chờ 1s và trả về dữ liệu mẫu
      await new Promise((resolve) => setTimeout(resolve, 500));
      const now = new Date();
      setApiResult({
        classes: [
          { id: 1, name: "Lớp A1", students: 30 },
          { id: 2, name: "Lớp A2", students: 28 },
          { id: 3, name: "Lớp A3", students: 32 },
        ],
        accessToken: session.accessToken,
        expiresAt: new Date(session.accessTokenExpires).toLocaleTimeString(),
        timestamp: now.toLocaleTimeString(),
      });
    } catch (err) {
      setApiResult({ error: "Không thể lấy dữ liệu" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", padding: 20 }}>
      <h2>📊 Dashboard Cố Vấn</h2>
      <div style={{ background: "#f5f5f5", padding: 15, borderRadius: 8, marginBottom: 20 }}>
        <p><strong>Người dùng:</strong> {session.user.name || session.user.email}</p>
        <p><strong>Role:</strong> {session.user.role}</p>
        <p>
          <strong>Access Token hết hạn sau:</strong>{" "}
          <span style={{ color: tokenExpiresIn <= 10 ? "red" : "green" }}>{tokenExpiresIn}s</span>
        </p>
        <p><strong>Token hiện tại:</strong> {session.accessToken?.substring(0, 20)}...</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <button
          onClick={fetchClasses}
          disabled={loading}
          style={{
            padding: "10px 20px",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
            marginRight: 10,
          }}
        >
          📋 Lấy danh sách lớp
        </button>
        <button
          onClick={() => signOut()}
          style={{
            padding: "10px 20px",
            background: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Đăng Xuất
        </button>
      </div>

      {apiResult && (
        <div style={{ background: apiResult.error ? "#ffebee" : "#e8f5e9", padding: 15, borderRadius: 8 }}>
          {apiResult.error ? (
            <p style={{ color: "red" }}>{apiResult.error}</p>
          ) : (
            <>
              <h4>📚 Kết quả:</h4>
              <pre style={{ whiteSpace: "pre-wrap", background: "white", padding: 10, borderRadius: 5 }}>
                {JSON.stringify(apiResult, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}

      <div style={{ marginTop: 20, background: "#f0f0f0", padding: 10, fontSize: 14 }}>
        <strong>Hướng dẫn demo:</strong>
        <ol>
          <li>Bấm "Lấy danh sách lớp" (token còn hạn) → thành công.</li>
          <li>Đợi 60 giây hoặc đến khi "Access Token hết hạn sau: 0s".</li>
          <li>Bấm lại "Lấy danh sách lớp" – mở Console (F12) bạn sẽ thấy log "Token hết hạn, đang refresh..." và request vẫn thành công.</li>
          <li>Người dùng không hề biết việc refresh token đang diễn ra.</li>
        </ol>
      </div>
    </div>
  );
}