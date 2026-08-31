const $ = (selector) => document.querySelector(selector);


function clock() {
  const element = $("#clock");

  if (element) {
    element.textContent = new Date().toLocaleTimeString(
      [],
      {
        hour12: false
      }
    );
  }
}


setInterval(clock, 1000);
clock();


async function post(path, payload) {

  const response = await fetch(
    path,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(payload)
    }
  );

  return response.json();
}


const analyzeButton = $("#analyzeBtn");


if (analyzeButton) {

  analyzeButton.addEventListener(
    "click",
    async () => {

      const target = $("#target").value.trim();
      const box = $("#result");

      box.className = "result neutral";
      box.textContent = "Analyzing locally…";

      try {

        const data = await post(
          "/api/analyze",
          {
            target
          }
        );

        const result = data.result;

        box.className =
          "result " +
          (result.valid ? "good" : "bad");

        box.innerHTML =
          `<strong>` +
          `${result.valid ? "VALID" : "INVALID"}` +
          `</strong> · ` +
          `${escapeHtml(result.message)}` +
          (
            result.scope
              ? ` · <span>${escapeHtml(result.scope)}</span>`
              : ""
          );

      } catch (error) {

        box.className = "result bad";

        box.textContent =
          "Unable to reach the local API.";
      }
    }
  );
}


function escapeHtml(value) {

  return String(value).replace(
    /[&<>'"]/g,
    (character) => {

      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
      };

      return entities[character];
    }
  );
}


document
  .querySelectorAll("[data-focus]")
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const target =
            document.querySelector(
              button.dataset.focus
            );

          target?.scrollIntoView(
            {
              behavior: "smooth"
            }
          );
        }
      );
    }
  );


const notesButton = $("#notesBtn");


if (notesButton) {

  notesButton.addEventListener(
    "click",
    () => {
      $("#notes")?.scrollIntoView(
        {
          behavior: "smooth"
        }
      );
    }
  );
}


const notes = $("#caseNotes");


if (notes) {

  notes.value =
    localStorage.getItem(
      "mkcyberhub_notes"
    ) || "";
}


const saveNotesButton = $("#saveNotes");


if (saveNotesButton) {

  saveNotesButton.addEventListener(
    "click",
    () => {

      localStorage.setItem(
        "mkcyberhub_notes",
        notes.value
      );

      $("#saveState").textContent =
        "Saved just now in this browser.";
    }
  );
}


const clearNotesButton = $("#clearNotes");


if (clearNotesButton) {

  clearNotesButton.addEventListener(
    "click",
    () => {

      notes.value = "";

      localStorage.removeItem(
        "mkcyberhub_notes"
      );

      $("#saveState").textContent =
        "Notes cleared.";
    }
  );
}


(async () => {

  try {

    const statsResponse =
      await fetch("/api/stats");

    const stats =
      await statsResponse.json();

    if (stats.platform) {

      $("#modules").textContent =
        stats.platform.modules;

      $("#endpoints").textContent =
        stats.platform.api_endpoints;
    }


    const newsResponse =
      await fetch("/api/news");

    const news =
      await newsResponse.json();

    $("#briefs").innerHTML =
      (news.items || [])
        .map(
          (item) =>
            `<div class="brief">
              <b>${escapeHtml(item.title)}</b>
              <span>${escapeHtml(item.tag)}</span>
            </div>`
        )
        .join("");


  } catch (error) {

    $("#briefs").innerHTML =
      `<div class="brief">
        <b>Local security brief unavailable.</b>
        <span>OFFLINE</span>
      </div>`;
  }

})();
