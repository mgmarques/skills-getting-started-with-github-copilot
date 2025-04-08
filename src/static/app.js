document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  async function loadActivities() {
    const activitiesList = document.getElementById("activities-list");
    activitiesList.innerHTML = "<p>Loading activities...</p>";

    try {
      const response = await fetch("/activities");
      const activities = await response.json();
      activitiesList.innerHTML = "";

      for (const [name, details] of Object.entries(activities)) {
        const card = document.createElement("div");
        card.className = "activity-card";

        card.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Max Participants:</strong> ${details.max_participants}</p>
          <div class="participants-section">
            <h5>Participants:</h5>
            <ul id="participants-${name.replace(/\s+/g, "-")}">
              <li>Loading participants...</li>
            </ul>
          </div>
        `;

        activitiesList.appendChild(card);

        // Fetch and display participants
        loadParticipants(name);
      }
    } catch (error) {
      activitiesList.innerHTML = "<p>Error loading activities.</p>";
    }
  }

  async function loadParticipants(activityName) {
    const participantsList = document.getElementById(`participants-${activityName.replace(/\s+/g, "-")}`);

    try {
      const response = await fetch(`/activities/${activityName}/participants`);
      const data = await response.json();
      participantsList.innerHTML = "";

      if (data.participants.length === 0) {
        participantsList.innerHTML = "<li>No participants yet.</li>";
      } else {
        data.participants.forEach((participant) => {
          const listItem = document.createElement("li");
          listItem.textContent = participant;
          participantsList.appendChild(listItem);
        });
      }
    } catch (error) {
      participantsList.innerHTML = "<li>Error loading participants.</li>";
    }
  }

  // Initialize app
  loadActivities();
});
