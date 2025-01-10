import { useState, FormEvent } from "react";

export default function TestEmail() {
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    text: "",
  });
  const [status, setStatus] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus("Email sent successfully!");
      } else {
        setStatus(`Error: ${result.message}`);
      }
    } catch (error) {
      setStatus("Failed to send email. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Test Email Sender</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>
            <strong>Recipient:</strong>
            <input
              type="email"
              placeholder="Recipient email"
              value={emailData.to}
              onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>
            <strong>Subject:</strong>
            <input
              type="text"
              placeholder="Email subject"
              value={emailData.subject}
              onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>
            <strong>Message:</strong>
            <textarea
              placeholder="Email content"
              value={emailData.text}
              onChange={(e) => setEmailData({ ...emailData, text: e.target.value })}
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px", minHeight: "100px" }}
            />
          </label>
        </div>
        <button
          type="submit"
          style={{
            backgroundColor: "#0070f3",
            color: "#fff",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Send Email
        </button>
      </form>
      {status && <p style={{ marginTop: "20px", color: status.includes("Error") ? "red" : "green" }}>{status}</p>}
    </div>
  );
}
