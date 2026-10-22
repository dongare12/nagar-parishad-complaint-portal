require("dotenv").config();

async function sendComplaintEmail({
  email,
  name,
  complaintId,
  category
}) {
  const response = await fetch(
    "https://api.sendpository.com/v1/emails",
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${process.env.SENDPOSITORY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
         from: "complaintregistrationportal.online",
        to: [email],
        subject: "Your complaint has been registered",
        html: `
          <h2>Complaint Registered Successfully</h2>
          <p>Hello ${escapeHtml(name)},</p>
          <p>Your complaint has been registered successfully.</p>
          <p><strong>Complaint ID:</strong> ${escapeHtml(complaintId)}</p>
          <p><strong>Category:</strong> ${escapeHtml(category)}</p>
          <p>Please keep your complaint ID to track its status.</p>
          <p>Nagar Parishad Complaint Management System</p>
        `
      })
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error?.message || JSON.stringify(result)
    );
  }

  return result;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

module.exports = { sendComplaintEmail };