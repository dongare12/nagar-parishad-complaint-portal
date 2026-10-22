
function openPhotoViewer(imageUrl, imageAlt) {
  // Remove an existing viewer, if any
  document.getElementById("photoLightbox")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "photoLightbox";
  overlay.className = "photo-lightbox";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "photo-lightbox-close";
  closeButton.textContent = "×";
  closeButton.setAttribute("aria-label", "Close image");

  const image = document.createElement("img");
  image.src = imageUrl;
  image.alt = imageAlt;
  image.className = "photo-lightbox-image";

  overlay.append(closeButton, image);
  document.body.appendChild(overlay);

  function closeViewer() {
    overlay.remove();
    document.removeEventListener("keydown", handleKeydown);
  }

  function handleKeydown(event) {
    if (event.key === "Escape") closeViewer();
  }

  closeButton.addEventListener("click", closeViewer);

  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeViewer();
  });

  document.addEventListener("keydown", handleKeydown);
}

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

    
    // Show before-and-after photos only if the complaint is Resolved
    if (complaint.status === "Resolved") {
      const photoSection = document.createElement("section");
      photoSection.className = "resolution-photos";

      const photoHeading = document.createElement("h3");
      photoHeading.textContent = "Complaint Resolution Photos";
      photoSection.appendChild(photoHeading);

      const photoComparison = document.createElement("div");
      photoComparison.className = "photo-comparison";

      // Before-resolution photo
      const beforeDiv = document.createElement("div");
      beforeDiv.className = "photo-item";

      const beforeHeading = document.createElement("h4");
      beforeHeading.textContent = "Before Resolution";
      beforeDiv.appendChild(beforeHeading);

      if (complaint.image?.url) {
        const beforeImg = document.createElement("img");
        beforeImg.src = complaint.image.url;
        beforeImg.alt = "Before resolution";
        beforeImg.className = "complaint-image";
        beforeImg.loading = "lazy";
        beforeImg.style.cursor = "zoom-in";
        beforeImg.title = "Click to enlarge";
        beforeImg.addEventListener("click", () => {
        openPhotoViewer(complaint.image.url, "Before resolution");
             });
         beforeDiv.appendChild(beforeImg);
      } else {
        const text = document.createElement("p");
        text.textContent = "No original photo available.";
        beforeDiv.appendChild(text);
      }

      // After-resolution photo
      const afterDiv = document.createElement("div");
      afterDiv.className = "photo-item";

      const afterHeading = document.createElement("h4");
      afterHeading.textContent = "After Resolution";
      afterDiv.appendChild(afterHeading);

      if (complaint.afterImage?.url) {
        const afterImg = document.createElement("img");
        afterImg.src = complaint.afterImage.url;
        afterImg.alt = "After resolution";
        afterImg.className = "complaint-image";
        afterImg.loading = "lazy";
        afterImg.style.cursor = "zoom-in";
        afterImg.title = "Click to enlarge";
        afterImg.addEventListener("click", () => {
        openPhotoViewer(complaint.afterImage.url, "After resolution");
          });
        afterDiv.appendChild(afterImg);
      } else {
        const text = document.createElement("p");
        text.textContent = "After-resolution photo is not available yet.";
        afterDiv.appendChild(text);
      }

      photoComparison.appendChild(beforeDiv);
      photoComparison.appendChild(afterDiv);
      photoSection.appendChild(photoComparison);
      result.appendChild(photoSection);
    }

    result.hidden = false;


    result.hidden = false;
  } catch (error) {
    message.textContent = error.message;
  }
});
