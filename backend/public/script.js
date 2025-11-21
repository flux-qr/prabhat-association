function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth" });
}

async function submitForm(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const budget = document.getElementById("budget").value.trim();
  const ptype = document.getElementById("ptype").value;
  const permission = document.getElementById("permission").checked;
  const statusEl = document.getElementById("form-status");

  statusEl.textContent = "";

  if (!permission) {
    alert("You must give permission to proceed.");
    return false;
  }

  if (!name || !phone || !budget) {
    alert("Please fill all fields.");
    return false;
  }

  const lead = {
    name,
    phone,
    budget,
    propertyType: ptype,
    consent: true
  };

  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead)
    });

    if (!res.ok) {
      throw new Error("Request failed");
    }

    statusEl.textContent = "Thank you! Your enquiry has been submitted.";
    statusEl.style.color = "green";
    event.target.reset();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Something went wrong. Please try again.";
    statusEl.style.color = "red";
  }

  return false;
}
