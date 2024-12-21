function colorModeToggle() {
  function attr(defaultVal, attrVal) {
    const defaultValType = typeof defaultVal;
    if (typeof attrVal !== "string" || attrVal.trim() === "") return defaultVal;
    if (attrVal === "true" && defaultValType === "boolean") return true;
    if (attrVal === "false" && defaultValType === "boolean") return false;
    if (isNaN(attrVal) && defaultValType === "string") return attrVal;
    if (!isNaN(attrVal) && defaultValType === "number") return +attrVal;
    return defaultVal;
  }

  const htmlElement = document.documentElement;
  const computed = getComputedStyle(htmlElement);
  let toggleEl;
  let togglePressed = "false";

  const scriptTag = document.querySelector("[list-colors]");
  if (!scriptTag) {
    console.warn("Script tag with list-colors attribute not found");
    return;
  }

  let colorModeDuration = attr(0.5, scriptTag.getAttribute("duration"));
  let colorModeEase = attr("power1.out", scriptTag.getAttribute("ease"));

  const cssVariables = scriptTag.getAttribute("list-colors");
  if (!cssVariables.length) {
    console.warn("Value of list-colors attribute not found");
    return;
  }

  let darkColors = {};
  let lightColors = {};
  cssVariables.split(",").forEach(function (item) {
    let darkValue = computed.getPropertyValue(`--dark--${item}`);
    let lightValue = computed.getPropertyValue(`--color--${item}`);
    if (darkValue.length) {
      if (!lightValue.length) lightValue = darkValue;
      darkColors[`--dark--${item}`] = darkValue;
      lightColors[`--dark--${item}`] = lightValue;
    }
  });

  if (!Object.keys(darkColors).length) {
    console.warn("No variables found matching list-colors attribute value");
    return;
  }

  function setColors(colorObject, animate) {
    if (typeof gsap !== "undefined" && animate) {
      gsap.to(htmlElement, {
        ...colorObject,
        duration: colorModeDuration,
        ease: colorModeEase,
      });
    } else {
      Object.keys(colorObject).forEach(function (key) {
        htmlElement.style.setProperty(key, colorObject[key]);
      });
    }
  }

  function goLight(light, animate) {
    if (light) {
      localStorage.setItem("light-mode", "true");
      htmlElement.classList.add("light-mode");
      setColors(lightColors, animate);
      togglePressed = "true";
    } else {
      localStorage.setItem("light-mode", "false");
      htmlElement.classList.remove("light-mode");
      setColors(darkColors, animate);
      togglePressed = "false";
    }
    if (typeof toggleEl !== "undefined") {
      toggleEl.forEach(function (element) {
        element.setAttribute("aria-pressed", togglePressed);
      });
    }
  }

  function checkPreference(e) {
    goLight(e.matches, false);
  }
  const colorPreference = window.matchMedia("(prefers-color-scheme: light)");
  colorPreference.addEventListener("change", (e) => {
    checkPreference(e);
  });

  let storagePreference = localStorage.getItem("light-mode");
  if (storagePreference !== null) {
    storagePreference === "true" ? goLight(true, false) : goLight(false, false);
  } else {
    checkPreference(colorPreference);
  }

  window.addEventListener("DOMContentLoaded", (event) => {
    toggleEl = document.querySelectorAll("[btn-color-toggle]");
    toggleEl.forEach(function (element) {
      element.setAttribute("aria-label", "View Light Mode");
      element.setAttribute("role", "button");
      element.setAttribute("aria-pressed", togglePressed);
    });
    document.addEventListener("click", function (e) {
      const targetElement = e.target.closest("[btn-color-toggle]");
      if (targetElement) {
        let lightClass = htmlElement.classList.contains("light-mode");
        lightClass ? goLight(false, true) : goLight(true, true);
      }
    });
  });
}
colorModeToggle();
