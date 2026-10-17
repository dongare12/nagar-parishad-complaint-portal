
const complaintForm = document.getElementById("complaintForm");
const formMessage = document.getElementById("formMessage");
const submitBtn = complaintForm
  ? complaintForm.querySelector('button[type="submit"]')
  : null;

const complaintsList = document.getElementById("complaintsList");
const refreshBtn = document.getElementById("refreshBtn");

// Safely display text in HTML
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// Read a JSON response safely
async function readResponse(response) {
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || `Request failed (${response.status})`
    );
  }

  return data;
}

// Load complaints and update dashboard
async function loadComplaints() {
  if (!complaintsList) return;

  complaintsList.textContent = "Loading complaints...";

  try {
    const response = await fetch("/complaints");
    const data = await readResponse(response);
    const complaints = data.complaints || [];

    const totalCount = document.getElementById("totalCount");
    const pendingCount = document.getElementById("pendingCount");
    const resolvedCount = document.getElementById("resolvedCount");

    if (totalCount) totalCount.textContent = complaints.length;

    if (pendingCount) {
      pendingCount.textContent = complaints.filter(
        c => c.status === "Pending"
      ).length;
    }

    if (resolvedCount) {
      resolvedCount.textContent = complaints.filter(
        c => c.status === "Resolved"
      ).length;
    }

    if (complaints.length === 0) {
      complaintsList.textContent = "No complaints registered yet.";
      return;
    }

    complaintsList.innerHTML = complaints.map(c => `
      <article class="complaint-item">
        <h3>${escapeHTML(c.category)}</h3>

        <p><strong>Name:</strong> ${escapeHTML(c.name)}</p>
        <p><strong>Phone:</strong> ${escapeHTML(c.phone)}</p>
        <p><strong>Location:</strong> ${escapeHTML(c.location)}</p>
        <p><strong>Description:</strong> ${escapeHTML(c.description)}</p>

        <p>
          <strong>Current Status:</strong>
          <span class="status ${
            c.status === "Resolved" ? "resolved" : ""
          }">
            ${escapeHTML(c.status)}
          </span>
        </p>

        <label for="status-${escapeHTML(c._id)}">
          Change Status
        </label>

        <select id="status-${escapeHTML(c._id)}">
          <option value="Pending"
            ${c.status === "Pending" ? "selected" : ""}>
            Pending
          </option>

          <option value="In Progress"
            ${c.status === "In Progress" ? "selected" : ""}>
            In Progress
          </option>

          <option value="Resolved"
            ${c.status === "Resolved" ? "selected" : ""}>
            Resolved
          </option>

          <option value="Rejected"
            ${c.status === "Rejected" ? "selected" : ""}>
            Rejected
          </option>
        </select>

        <button
          type="button"
          class="update-status-btn"
          data-id="${escapeHTML(c._id)}">
          Update Status
        </button>
      </article>
    `).join("");

  } catch (error) {
    complaintsList.textContent =
      "Error loading complaints: " + error.message;
  }
}

// Update complaint status
if (complaintsList) {
  complaintsList.addEventListener("click", async (event) => {
    const button = event.target.closest(".update-status-btn");

    if (!button) return;

    const complaintId = button.dataset.id;
    const statusSelect = document.getElementById(
      `status-${complaintId}`
    );

    if (!statusSelect) return;

    const newStatus = statusSelect.value;

    // The backend requires a resolution message for Resolved.
    let resolution = "";

    if (newStatus === "Resolved") {
      resolution = prompt(
        "Enter the resolution details for this complaint:"
      );

      if (resolution === null || !resolution.trim()) {
        alert("Please enter the resolution details.");
        return;
      }
    }

    button.disabled = true;
    button.textContent = "Updating...";

    try {
      const response = await fetch(
        `/complaints/${encodeURIComponent(complaintId)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: newStatus,
            ...(newStatus === "Resolved"
              ? { resolution: resolution.trim() }
              : {})
          })
        }
      );

      await readResponse(response);

      alert("Complaint status updated successfully!");
      await loadComplaints();

    } catch (error) {
      alert("Error updating status: " + error.message);
      button.disabled = false;
      button.textContent = "Update Status";
    }
  });
}

// Register a new complaint

 // Register a new complaint
if (complaintForm) {
  complaintForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!formMessage || !submitBtn) return;

    const imageInput = document.getElementById("image");
    const selectedImage = imageInput?.files?.[0];

    // Validate the selected image
    if (selectedImage) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
      ];

      if (!allowedTypes.includes(selectedImage.type)) {
        formMessage.textContent =
          "Please select a JPG, PNG, or WebP image.";
        formMessage.style.color = "red";
        return;
      }

      if (selectedImage.size > 5 * 1024 * 1024) {
        formMessage.textContent =
          "Image size must not exceed 5 MB.";
        formMessage.style.color = "red";
        return;
      }
    }

    // Collect form fields and optional image
    const formData = new FormData(complaintForm);

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
    formMessage.textContent = "";

    try {
      const response = await fetch("/complaints", {
        method: "POST",
        body: formData
      });

      await readResponse(response);

      formMessage.textContent =
        "Complaint registered successfully!";
      formMessage.style.color = "green";

      complaintForm.reset();

      // Refresh the list if it exists on this page
      if (complaintsList) {
        await loadComplaints();
      }

    } catch (error) {
      formMessage.textContent = error.message;
      formMessage.style.color = "red";

    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Complaint";
    }
  });
}


      // Reload only if this page is authorized to view complaints.
  //     if (complaintsList) {
  //       await loadComplaints();
  //     }

  //   } catch (error) {
  //     formMessage.textContent = error.message;
  //     formMessage.style.color = "red";

  //   } finally {
  //     submitBtn.disabled = false;
  //     submitBtn.textContent = "Submit Complaint";
  //   }
  // });


// Refresh complaints


if (refreshBtn) {
  refreshBtn.addEventListener("click", loadComplaints);
}

// Load complaints when the page opens
if (complaintsList) {
  loadComplaints();
}


// Refresh complaints
if (refreshBtn) {
  refreshBtn.addEventListener("click", loadComplaints);
}

// Load complaints when the page opens
if (complaintsList) {
  loadComplaints();
}

