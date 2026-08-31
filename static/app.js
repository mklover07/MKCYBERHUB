"use strict";

/*
 * MK Cyber Hub
 * Frontend interaction layer
 *
 * Defensive / authorized security research only.
 */


/* =========================
   LIVE CLOCK
========================= */

const liveClock = document.getElementById("liveClock");

function updateClock() {
    if (!liveClock) return;

    const now = new Date();

    liveClock.textContent = now.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }
    );
}

updateClock();

setInterval(updateClock, 1000);


/* =========================
   TARGET ANALYZER
========================= */

const targetInput = document.getElementById("targetInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const analysisResult = document.getElementById("analysisResult");


function classifyTarget(value) {

    const target = value.trim();

    if (!target) {
        return {
            type: "EMPTY",
            message: "Please enter a domain, IP address or URL."
        };
    }


    /*
     * IPv4 format validation
     */

    const ipv4Pattern =
        /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;


    if (ipv4Pattern.test(target)) {
        return {
            type: "IP",
            message: "IPv4 indicator detected."
        };
    }


    /*
     * URL validation
     */

    try {

        const url =
            target.startsWith("http://") ||
            target.startsWith("https://")
                ? new URL(target)
                : new URL(`https://${target}`);


        if (url.hostname) {
            return {
                type: "DOMAIN",
                message:
                    `Domain/URL indicator detected: ${url.hostname}`
            };
        }

    } catch (error) {
        // Continue with generic indicator classification.
    }


    /*
     * Generic indicator
     */

    if (
        /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(target)
    ) {
        return {
            type: "DOMAIN",
            message:
                `Domain indicator detected: ${target}`
        };
    }


    return {
        type: "INDICATOR",
        message:
            "Input received. Validate the indicator before investigation."
    };
}


function runAnalysis() {

    if (!analysisResult || !targetInput) return;


    const value = targetInput.value;

    const result = classifyTarget(value);


    analysisResult.classList.remove(
        "good",
        "bad"
    );


    if (result.type === "EMPTY") {

        analysisResult.classList.add("bad");

        analysisResult.innerHTML =
            "<strong>Input required.</strong> " +
            result.message;

        return;
    }


    analysisResult.classList.add("good");


    analysisResult.innerHTML =
        `<strong>${result.type}</strong> ${result.message}`;
}


if (analyzeBtn) {

    analyzeBtn.addEventListener(
        "click",
        runAnalysis
    );

}


if (targetInput) {

    targetInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {
                runAnalysis();
            }

        }
    );

}


/* =========================
   INVESTIGATION NOTES
========================= */

const notes =
    document.getElementById("investigationNotes");

const saveStatus =
    document.getElementById("saveStatus");

const clearNotes =
    document.getElementById("clearNotes");


const NOTES_KEY =
    "mk_cyber_hub_investigation_notes";


function loadNotes() {

    if (!notes) return;

    try {

        const saved =
            localStorage.getItem(NOTES_KEY);

        if (saved !== null) {

            notes.value = saved;

            if (saveStatus) {
                saveStatus.textContent =
                    "Saved notes restored from this browser.";
            }

        }

    } catch (error) {

        if (saveStatus) {
            saveStatus.textContent =
                "Local storage is unavailable.";
        }

    }
}


function saveNotes() {

    if (!notes) return;

    try {

        localStorage.setItem(
            NOTES_KEY,
            notes.value
        );


        if (saveStatus) {

            saveStatus.textContent =
                "Notes saved locally.";

        }

    } catch (error) {

        if (saveStatus) {

            saveStatus.textContent =
                "Unable to save notes.";

        }

    }
}


function clearInvestigationNotes() {

    if (!notes) return;


    notes.value = "";


    try {

        localStorage.removeItem(
            NOTES_KEY
        );


        if (saveStatus) {

            saveStatus.textContent =
                "Investigation notes cleared.";

        }

    } catch (error) {

        if (saveStatus) {

            saveStatus.textContent =
                "Unable to clear local notes.";

        }

    }
}


loadNotes();


if (notes) {

    /*
     * Save after the user stops typing
     * for a short period.
     */

    let saveTimer;


    notes.addEventListener(
        "input",
        function () {

            clearTimeout(saveTimer);

            saveTimer = setTimeout(
                saveNotes,
                500
            );

        }
    );

}


if (clearNotes) {

    clearNotes.addEventListener(
        "click",
        clearInvestigationNotes
    );

}


/* =========================
   MODULE BUTTONS
========================= */

const moduleButtons =
    document.querySelectorAll(
        "[data-module]"
    );


moduleButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const moduleName =
                    button.dataset.module;


                if (analysisResult) {

                    analysisResult.classList.remove(
                        "bad"
                    );

                    analysisResult.classList.add(
                        "good"
                    );


                    analysisResult.innerHTML =
                        `<strong>${moduleName}</strong> ` +
                        "Module selected. " +
                        "Use authorized data for further analysis.";

                }


                /*
                 * Bring the workspace into view.
                 */

                const workspace =
                    document.getElementById(
                        "workspace"
                    );


                if (workspace) {

                    workspace.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    }
);


/* =========================
   SERVICE HEALTH CHECK
========================= */

async function checkServiceHealth() {

    try {

        const response =
            await fetch(
                "/health",
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    },
                    cache: "no-store"
                }
            );


        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        if (
            data &&
            data.status === "online"
        ) {

            document.body.dataset.apiStatus =
                "online";

        }

    } catch (error) {

        document.body.dataset.apiStatus =
            "offline";

    }

}


checkServiceHealth();


/* =========================
   CONSOLE BRANDING
========================= */

console.log(
    "%cMK CYBER HUB",
    "font-size:18px;font-weight:800;"
);

console.log(
    "Defensive cyber intelligence workspace."
);

console.log(
    "Use only for authorized security research."
);
