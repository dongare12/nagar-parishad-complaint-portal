
const complaintsList = document.getElementById("complaintsList");
const pageMessage = document.getElementById("pageMessage");
const resultsCount = document.getElementById("resultsCount");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const categoryFilter = document.getElementById("categoryFilter");
const refreshBtn = document.getElementById("refreshBtn");

let allComplaints = [];


async function loadComplaints() {
  try {
    complaintsList.textContent = "Loading complaints...";

    const response = await fetch("/complaints", {
      credentials: "same-origin"
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();

    console.log("Complaints API response:", data);

    if (Array.isArray(data)) {
      allComplaints = data;
    } else if (Array.isArray(data.complaints)) {
      allComplaints = data.complaints;
    } else {
      throw new Error("Unexpected complaints API response format.");
    }

    updateStatistics();
    displayComplaints();

    pageMessage.textContent = "";

  } catch (error) {
    console.error("Error loading complaints:", error);

    complaintsList.textContent = "Unable to load complaints.";
    pageMessage.textContent = error.message;
  }
}


function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function updateStatistics() {
  document.getElementById("totalCount").textContent =
    allComplaints.length;

  document.getElementById("pendingCount").textContent =
    allComplaints.filter(c => c.status === "Pending").length;

  document.getElementById("progressCount").textContent =
    allComplaints.filter(c => c.status === "In Progress").length;

  document.getElementById("resolvedCount").textContent =
    allComplaints.filter(c => c.status === "Resolved").length;

  document.getElementById("rejectedCount").textContent =
    allComplaints.filter(c => c.status === "Rejected").length;
}

function displayComplaints() {
  const search = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;
  const selectedCategory = categoryFilter.value;

  const filtered = allComplaints.filter(c => {
    const matchesSearch =
      String(c.name ?? "").toLowerCase().includes(search) ||
      String(c.location ?? "").toLowerCase().includes(search) ||
      String(c._id ?? "").toLowerCase().includes(search);

    const matchesStatus =
      selectedStatus === "All" || c.status === selectedStatus;

    const matchesCategory =
      selectedCategory === "All" || c.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  resultsCount.textContent =
    `Showing ${filtered.length} of ${allComplaints.length} complaints`;

  if (filtered.length === 0) {
    complaintsList.textContent = "No matching complaints found.";
    return;
  }

 complaintsList.innerHTML = filtered.map(c => `
    <article class="complaint-card">
      <h3>${escapeHTML(c.category)} Complaint</h3>

      <p><strong>Complaint ID:</strong> ${escapeHTML(c._id)}</p>
      <p><strong>Citizen:</strong> ${escapeHTML(c.name)}</p>
      <p><strong>Phone:</strong> ${escapeHTML(c.phone)}</p>
      <p><strong>Location:</strong> ${escapeHTML(c.location)}</p>
      <p><strong>Description:</strong> ${escapeHTML(c.description)}</p>

       ${
        c.image && c.image.url
          ? `
            <div class="complaint-photo">
              <strong>Problem Photo:</strong>
              <a href="${escapeHTML(c.image.url)}"
                 target="_blank"
                 rel="noopener noreferrer">
                <img
                  src="${escapeHTML(c.image.url)}"
                  alt="Reported complaint"
                  class="complaint-image"
                >
              </a>
            </div>
          `
          : `<p><strong>Problem Photo:</strong> No photo uploaded.</p>`
      }

      <p>
        <strong>Status:</strong>
        <span class="status-label ${
          c.status === "Resolved" ? "resolved" :
          c.status === "Rejected" ? "rejected" : ""
        }">${escapeHTML(c.status)}</span>
      </p>

      <label for="status-${escapeHTML(c._id)}">Update Status</label>
      <select id="status-${escapeHTML(c._id)}">
        ${["Pending", "In Progress", "Resolved", "Rejected"].map(status =>
          `<option value="${status}" ${
            c.status === status ? "selected" : ""
          }>${status}</option>`
        ).join("")}
      </select>

      <label for="remarks-${escapeHTML(c._id)}">Admin Remarks</label>
      <textarea id="remarks-${escapeHTML(c._id)}"
        placeholder="Enter remarks...">${escapeHTML(c.remarks)}</textarea>

      <label for="resolution-${escapeHTML(c._id)}">Resolution Details</label>
      <textarea id="resolution-${escapeHTML(c._id)}"
        placeholder="Describe the work completed...">${escapeHTML(c.resolution)}</textarea>
      
<label for="afterImage-${escapeHTML(c._id)}">
  After-Resolution Photo
</label>

<input
  type="file"
  id="afterImage-${escapeHTML(c._id)}"
  class="after-image-input"
  accept="image/jpeg,image/png,image/webp"
/>

${
  c.afterImage && c.afterImage.url
    ? `
      <div class="complaint-photo">
        <strong>After-Resolution Photo:</strong>
        <a href="${escapeHTML(c.afterImage.url)}"
           target="_blank"
           rel="noopener noreferrer">
          <img
            src="${escapeHTML(c.afterImage.url)}"
            alt="After-resolution repair"
            class="complaint-image"
          >
        </a>
      </div>
    `
    : `<p><strong>After-Resolution Photo:</strong> Not uploaded yet.</p>`
}


      <button type="button" class="save-complaint-btn"
        data-id="${escapeHTML(c._id)}">Save Changes</button>

        <button
  type="button"
  class="delete-complaint-btn"
  data-id="${escapeHTML(c._id)}">
  Delete Complaint
        </button>

    </article>
  `).join("");
}


complaintsList.addEventListener("click", async (event) => {
  const saveButton = event.target.closest(".save-complaint-btn");
  const deleteButton = event.target.closest(".delete-complaint-btn");

  // Save complaint changes
  if (saveButton) {
    const id = saveButton.dataset.id;
    const status = document.getElementById(`status-${id}`).value;
    const remarks = document.getElementById(`remarks-${id}`).value.trim();
    const resolution = document.getElementById(`resolution-${id}`).value.trim();

    if (status === "Resolved" && !resolution) {
      pageMessage.textContent =
        "Enter resolution details before marking the complaint Resolved.";
      return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";

    // try {
    //   const response = await fetch(
    //     `/complaints/${encodeURIComponent(id)}/status`,
    //     {
    //       method: "PATCH",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify({ status, remarks, resolution })
    //     }
    //   );

      

try {
  const formData = new FormData();

  formData.append("status", status);
  formData.append("remarks", remarks || "");
  formData.append("resolution", resolution || "");


const imageInput = document.getElementById(`afterImage-${id}`);

  if (imageInput && imageInput.files.length > 0) {
  formData.append("afterImage", imageInput.files[0]);
}

  const response = await fetch(
    `/complaints/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: formData
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Unable to save complaint.");
  }

  pageMessage.textContent = "Complaint updated successfully.";
  await loadComplaints();

} catch (error) {
  pageMessage.textContent = "Error: " + error.message;
  saveButton.disabled = false;
  saveButton.textContent = "Save Changes";
}

return;
}

// Delete complaint
if (deleteButton) {
  const id = deleteButton.dataset.id;

  const confirmed = confirm(
    "Are you sure you want to delete this complaint? This action cannot be undone."
  );

  if (!confirmed) return;

  deleteButton.disabled = true;
  deleteButton.textContent = "Deleting...";

  try {
    const response = await fetch(
      `/complaints/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to delete complaint.");
    }

    pageMessage.textContent = "Complaint deleted successfully.";
    await loadComplaints();

  } catch (error) {
    pageMessage.textContent = "Error: " + error.message;
    deleteButton.disabled = false;
    deleteButton.textContent = "Delete Complaint";
  }
}
});



searchInput.addEventListener("input", displayComplaints);
statusFilter.addEventListener("change", displayComplaints);
categoryFilter.addEventListener("change", displayComplaints);
refreshBtn.addEventListener("click", loadComplaints);

loadComplaints();
