async function loadCommunity() {
  const { owner, repo } = window.currentRepo;
  const tabContent = document.getElementById("tab-content");
  tabContent.innerHTML =
    '<div class="preloader">Loading community profile...</div>';

  try {
    const profile = await fetchCommunityProfile(owner, repo);
    console.log("Community profile:", profile);

    const percent = profile.health_percentage ?? 0;
    let filesHtml = "";

    if (profile.files && typeof profile.files === "object") {
      // Map the raw API keys to human-readable labels
      const labelMap = {
        code_of_conduct: "Code of Conduct",
        code_of_conduct_file: "Code of Conduct (file)",
        contributing: "Contributing Guide",
        issue_template: "Issue Template",
        pull_request_template: "Pull Request Template",
        license: "License",
        readme: "README",
      };

      const entries = Object.entries(profile.files);
      filesHtml = '<ul class="community-files">';

      entries.forEach(([key, value]) => {
        const label = labelMap[key] || key.replace(/_/g, " ");
        const isPresent = value !== null && value !== undefined;
        const icon = isPresent ? "✅" : "❌";
        const statusClass = isPresent ? "present" : "missing";
        const linkHtml =
          isPresent && value.html_url
            ? `<a href="${value.html_url}" target="_blank">View</a>`
            : "None";

        filesHtml += `
                    <li class="${statusClass}">
                        ${icon} <strong>${label}</strong> – ${linkHtml}
                    </li>`;
      });

      filesHtml += "</ul>";
    } else {
      filesHtml = "<p>No community file information available.</p>";
    }

    const html = `
            <div class="community-card">
                <h2>Community Health</h2>
                <p>${profile.description || "No description"}</p>
                <div class="health-bar-container">
                    <div class="health-bar" style="width:${percent}%"></div>
                    <span class="health-percent">${percent}%</span>
                </div>
                <h3>Files</h3>
                ${filesHtml}
            </div>`;
    tabContent.innerHTML = html;
  } catch (err) {
    console.error("Community fetch error:", err);
    tabContent.innerHTML = "";
    showError("Failed to load community profile");
  }
}
