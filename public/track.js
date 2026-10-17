
const trackForm = document.getElementById("trackForm");
const message = document.getElementById("message");
const result = document.getElementById("result");

trackForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  message.textContent = "Checking complaint...";
  result.hidden = true;
  result.replaceChildren();

  const complaintId = document.getElementById("complaintId").value.trim();
  const phone = document.getElementById("phone").value.trim();

  try {
    const response = await fetch("/complaints/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ complaintId, phone })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to find complaint.");
    }

    const complaint = data.complaint;

    message.textContent = "";

    const details = [
      ["Complaint ID", complaint.complaintId],
      ["Category", complaint.category],
      ["Status", complaint.status],
      ["Location", complaint.location],
      ["Admin Remarks", complaint.remarks || "No remarks yet"],
      ["Resolution", complaint.resolution || "No resolution details yet"],
      ["Last Updated", complaint.updatedAt
        ? new Date(complaint.updatedAt).toLocaleString()
        : "Not available"]
    ];

    const heading = document.createElement("h2");
    heading.textContent = "Complaint Details";
    result.appendChild(heading);

    details.forEach(([label, value]) => {
      const paragraph = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = label + ": ";
      paragraph.appendChild(strong);
      paragraph.appendChild(document.createTextNode(String(value)));
      result.appendChild(paragraph);
    });

    result.hidden = false;
  } catch (error) {
    message.textContent = error.message;
  }
});
