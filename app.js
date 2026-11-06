const STORAGE_KEY = "casework-cases";
const caseList = document.querySelector("#case-list");
const emptyState = document.querySelector("#empty-state");
const dialog = document.querySelector("#case-dialog");
const form = document.querySelector("#case-form");
const toast = document.querySelector("#toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3500);
}

function loadCases() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error("Saved case list is not valid.");
    return parsed;
  } catch (error) {
    console.error("Could not read saved cases.", error);
    showToast("Could not read saved cases from this browser.");
    return [];
  }
}

let cases = loadCases();

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function renderCases() {
  emptyState.hidden = cases.length > 0;
  caseList.innerHTML = cases.map((item) => `
    <article class="case-row">
      <div class="case-details">
        <span class="case-name">${escapeHtml(item.name)}</span>
        <span class="case-number">Case ${escapeHtml(item.number)}</span>
      </div>
      <span class="evidence-count">${Number(item.evidenceCount) || 0} ${Number(item.evidenceCount) === 1 ? "file" : "files"}</span>
    </article>
  `).join("");
}

function openForm() {
  form.reset();
  document.querySelector("#form-error").hidden = true;
  dialog.showModal();
  form.elements.name.focus();
}

document.querySelector("#open-form").addEventListener("click", openForm);
document.querySelector("#close-form").addEventListener("click", () => dialog.close());
document.querySelector("#cancel-form").addEventListener("click", () => dialog.close());

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const formData = new FormData(form);
  const evidenceCount = form.elements.evidence.files.length;
  cases.unshift({
    name: String(formData.get("name")).trim(),
    number: String(formData.get("number")).trim(),
    evidenceCount,
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  } catch (error) {
    console.error("Could not save cases in this browser.", error);
    cases.shift();
    document.querySelector("#form-error").textContent = "Could not save this case in your browser.";
    document.querySelector("#form-error").hidden = false;
    return;
  }

  renderCases();
  dialog.close();
  showToast("Case saved.");
});

renderCases();
