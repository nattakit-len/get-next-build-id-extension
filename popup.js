// ============================================
// Working on current tab side.
// ============================================
const findBuildID = () => {
  const result = {
    hostname: window.location.hostname,
    buildId: "",
    page: "",
  };

  const nextDataScript = document.getElementById("__NEXT_DATA__");
  if (nextDataScript) {
    const nextDataString = nextDataScript.innerHTML;
    const jsonNextData = JSON.parse(nextDataString);

    result.page = jsonNextData.page;
    result.buildId = jsonNextData.buildId;
  }

  return result;
};

// ===============================================
// Working on extension page side.
// ===============================================
const buildIdEl = document.getElementById("buildIdText");
const hostnameEl = document.getElementById("hostname");
const iconEl = document.getElementById("icon");

// Copy function
const copyEl = document.getElementById("copy-btn");
const copyToClipboard = () => {
  const tempValue = buildIdEl.value;
  navigator.clipboard.writeText(tempValue);
  buildIdEl.setAttribute("value", "Copied");

  setTimeout(() => {
    buildIdEl.setAttribute("value", tempValue);
  }, 1000);
};
copyEl.addEventListener("click", copyToClipboard);

// Switch theme function
const html = document.getElementsByTagName("html")[0];
const lightModeEl = document.getElementById("light-mode-btn");
const darkModeEl = document.getElementById("dark-mode-btn");
const switchTheme = async () => {
  // Init theme into localstorage.
  const theme = await chrome.storage.sync.get("getBuildIdTheme");
  if (Object.keys(theme).length === 0) return;

  // Switch theme process.
  if (theme.getBuildIdTheme === "light") {
    lightModeEl.setAttribute("class", "animate-rotateOut");
    html.setAttribute("class", "dark-mode");

    setTimeout(async () => {
      darkModeEl.style.display = "inherit";
      darkModeEl.setAttribute("class", "animate-rotateIn");

      lightModeEl.style.display = "none";
      await chrome.storage.sync.set({ getBuildIdTheme: "dark" });
    }, 250);
  } else {
    darkModeEl.setAttribute("class", "animate-rotateOut");
    html.setAttribute("class", "light-mode");

    setTimeout(async () => {
      lightModeEl.style.display = "inherit";
      lightModeEl.setAttribute("class", "animate-rotateIn");

      darkModeEl.style.display = "none";
      await chrome.storage.sync.set({ getBuildIdTheme: "light" });
    }, 250);
  }
};
lightModeEl.addEventListener("click", switchTheme);
darkModeEl.addEventListener("click", switchTheme);

// Init Function
const getCurrentTab = async () => {
  const queryOptions = { active: true, lastFocusedWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
};

(async () => {
  // Theme setup
  const theme = await chrome.storage.sync.get("getBuildIdTheme");
  if (Object.keys(theme).length === 0) {
    await chrome.storage.sync.set({ getBuildIdTheme: "light" });
  }

  if (typeof theme.getBuildIdTheme === "undefined") return;

  if (theme.getBuildIdTheme === "light") {
    html.setAttribute("class", "light-mode");
    lightModeEl.style.display = "inherit";
    darkModeEl.style.display = "none";
  } else {
    html.setAttribute("class", "dark-mode");
    lightModeEl.style.display = "none";
    darkModeEl.style.display = "inherit";
  }

  // BuildID setup
  const tab = await getCurrentTab();
  if (tab.url.startsWith("chrome://")) {
    hostnameEl.innerHTML = "Dimension";
    iconEl.style.display = "none";
    buildIdEl.setAttribute("value", "C-137");
    copyEl.style.display = "none";
    return;
  }

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: findBuildID,
    },
    ([{ result }]) => {
      if (tab.favIconUrl) {
        iconEl.setAttribute("src", tab.favIconUrl);
      } else {
        iconEl.style.display = "none";
      }

      hostnameEl.innerHTML = result.hostname;
      if (result.buildId) {
        buildIdEl.setAttribute("value", result.buildId);
      } else {
        buildIdEl.setAttribute("value", "N/A");
        copyEl.style.display = "none";
      }
    }
  );

  // Prevent flicker
  const customStyleEl = document.getElementById("custom-styles");
  customStyleEl.innerHTML = `body, input[type="text"], .fader { transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out; }`;
})();
