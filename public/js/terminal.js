"use strict";

// *** INIT ***
window.onload = function init() {
  const terminal = new Terminal();
  terminal.loadNightmode();
  terminal.menu();
  // terminal.homeDemo();
};

// *** TERMINAL FRAMEWORK ***
const Terminal = function() {
  // * DOM VARIABLES *
  const body = document.querySelector("body"),
    terminal = document.querySelector(".terminal"),
    terminalTitle = document.querySelector(".terminal__title"),
    terminalBar = document.querySelector(".terminal__bar"),
    firstLine = document.querySelector("#firstLine"),
    lastLine = document.querySelector("#lastLine"),
    home = document.querySelector("#home"),
    about = document.querySelector("#about"),
    portfolio = document.querySelector("#portfolio"),
    contact = document.querySelector("#contact"),
    nightmode = document.querySelector("#nightmode"),
    closeTerminalButton = document.querySelector(".terminal__circle--red");

  // * CLICK LISTENERS *
  let selectedLink = home;
  const menuArray = [home, about, portfolio, contact, nightmode];
  menuArray.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      if (link !== nightmode) {
        // selectedLink is used to remember which page link was last clicked, so nightmode is excluded
        selectedLink = link;
      }
      selectLink(link);
    });
  });

  closeTerminalButton.addEventListener("click", () => {
    if (firstLine.innerHTML === "~$ ls") {
      changeDir(selectedLink);
    } else {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  // * PRINT PROMPT *
  const prompt = function(line, dir = "~") {
    addCursorFocus(line);
    line.innerHTML = `${dir}$ `;
  };

  // * TYPING FUNCTION *
  const typeSpeed = 50;

  function type(word, i, line, speed) {
    line.classList.remove("cursor-blink");
    if (i < word.length) {
      line.innerHTML += word[i];
      i++;
      if (word[i] === " " || word[i] === ".") {
        // pause for longer if between words or at a dot
        setTimeout(() => {
          type(word, i, line, speed);
        }, 200);
      } else {
        setTimeout(() => {
          type(word, i, line, speed);
        }, speed);
      }
    }
  }

  // * TYPE LS *
  const typeLS = function(line) {
    type("ls", 0, line, typeSpeed);
  };

  // * TYPE CD *
  function typeCD(line, menuLink) {
    type(`cd ${menuLink}`, 0, line, typeSpeed);
  }

  // * TYPE MENU *
  const menuSpeed = 10;

  function typeMenu(i = 0) {
    if (i < menuArray.length) {
      addCursorFocus(menuArray[i]);
      type(menuArray[i].id, 0, menuArray[i], menuSpeed);
      setTimeout(() => {
        if (menuArray[i] === nightmode) {
          // Hoverable 'on'/'off' only visible once the link for nightmode itself is typed
          // The 'content-empty' class is added again by clearMenu()
          nightmode.classList.remove("content-empty");
        }
        removeCursorFocus(menuArray[i]);
        i++;
        typeMenu(i);
      }, 120);
    } else {
      prompt(lastLine);
    }
  }

  // * SHOW MENU *
  const menu = function(delay = 1000) {
    prompt(firstLine);
    addCursorFocus(firstLine);
    setTimeout(() => {
      typeLS(firstLine);
      setTimeout(() => {
        toggleDouble(firstLine);
        setTimeout(() => {
          removeCursorFocus(firstLine);
          typeMenu();
        }, 500);
      }, 300);
    }, delay);
  };

  // * CLEAR MENU *
  const lineArray = [
    firstLine,
    lastLine,
    home,
    about,
    portfolio,
    contact,
    nightmode
  ];

  const clearMenu = function() {
    nightmode.classList.add("content-empty");
    lineArray.forEach(line => {
      line.innerHTML = "";
      removeCursorFocus(line);
    });
    closeTerminalButton.removeEventListener("click", () => {
      changeDir(selectedLink);
    });
  };

  // * SELECT LINK, UPDATE TERMINAL *
  const selectLink = function(link) {
    toggleDouble(link);
    setTimeout(() => {
      if (link.id === "nightmode") {
        toggleNightmode();
      } else {
        changeDir(link);
      }
    }, 500);
  };

  // * CHANGE DIRECTORY *
  function changeDir(link) {
    typeCD(lastLine, link.id);
    setTimeout(() => {
      toggleDouble(lastLine);
      setTimeout(() => {
        // updateTitle(link.id); // ! temp turning off so alexmoglia is always at top of terminal
        collapseTerminal();
        clearMenu();
        prompt(firstLine, link.id);
        displayCard(link);
      }, 700);
    }, link.id.length * 100);
  }

  // * DISPLAY CARD *
  const homeCard = document.querySelector("#homeCard"),
    aboutCard = document.querySelector("#aboutCard"),
    portfolioCard = document.querySelector("#portfolioCard"),
    contactCard = document.querySelector("#contactCard"),
    cardList = [homeCard, aboutCard, portfolioCard, contactCard];

  function displayCard(link) {
    const targetCard = `${link.id}Card`;
    cardList.forEach(card => {
      card.classList.add("display-none");
      if (card.id === targetCard) {
        card.classList.remove("display-none");
      }
    });
  }

  // * COLLAPSE TERMINAL *
  function collapseTerminal() {
    toggleExpandCollpase();
    terminal.addEventListener("click", expandTerminal);
  }

  // * EXPAND TERMINAL *
  function expandTerminal() {
    terminal.removeEventListener("click", expandTerminal);

    type("cd", 0, firstLine, typeSpeed);
    setTimeout(() => {
      toggleDouble(firstLine);
      setTimeout(() => {
        clearMenu();
        // updateTitle("alexmoglia"); // ! temp off - see line ~156
        toggleExpandCollpase();
        menu(1500);
        setTimeout(() => {
          displayCard(selectedLink);
        }, 1500);
      }, 500);
    }, 300);
  }

  // * TOGGLE TERMINAL EXPAND/COLLPASE CLASSES *
  function toggleExpandCollpase() {
    terminal.classList.toggle("terminal--collapsed");
    document.querySelector("#bodyWrap").classList.toggle("overflow-hidden");
    // nightmode.classList.toggle("content-empty");
    document.querySelector(".nav").classList.toggle("navCollapse");
    document
      .querySelector("#terminalInitials")
      .classList.toggle("opacity-zero");
  }

  // * UPDATE TERMINAL TITLE *
  const updateTitle = function(link) {
    terminalTitle.innerHTML = `${link} - bash`;
  };

  // * ADD CURSOR FOCUS CLASSES *
  function addCursorFocus(line) {
    if (nightmodeOnFlag) {
      line.classList.add("cursor--nightmode");
    }
    line.classList.add("cursor-focus");
    if (line === firstLine || line === lastLine) {
      line.classList.add("cursor-blink");
    }
  }

  // * REMOVE CURSOR FOCUS CLASSES *
  function removeCursorFocus(line) {
    line.classList.remove("cursor--nightmode");
    line.classList.remove("cursor-focus");
    line.classList.remove("cursor-blink");
  }

  // * TOGGLE SELECT-FLASH CLASS ON & OFF *
  function toggleDouble(line) {
    line.classList.add("select-flash");
    setTimeout(() => {
      line.classList.remove("select-flash");
    }, 1000);
  }

  // *** NIGHTMODE ***
  const loadNightmodeOnFlag = function() {
    // called at window.onload
    if (localStorage.nightmodeOnFlag === "true") {
      toggleNightmodeStyles();
      nightmodeOnFlag = true;
    }
  };

  let nightmodeOnFlag = false;

  function toggleNightmode() {
    if (!nightmodeOnFlag) {
      type("node nightmode.js", 0, lastLine, typeSpeed);
    } else {
      type("kill nightmode.js", 0, lastLine, typeSpeed);
    }
    setTimeout(() => {
      toggleDouble(lastLine);
      setTimeout(() => {
        clearMenu();
        toggleNightmodeStyles();
        setTimeout(() => {
          menu(500);
        }, 500);
      }, 500);
    }, 1500);
    nightmodeOnFlag = !nightmodeOnFlag;
    localStorage.nightmodeOnFlag = nightmodeOnFlag;
  }

  function toggleNightmodeStyles() {
    // * Gradient Nightmode Change *
    body.classList.toggle("body--nightmode");

    // * Terminal Nightmode Changes *
    terminal.classList.toggle("terminal--nightmode");
    terminalTitle.classList.toggle("terminal__title--nightmode");
    terminalBar.classList.toggle("terminal__bar--nightmode");
    lineArray.forEach(line => {
      line.classList.toggle("terminal__line--nightmode");
    });
    menuArray.forEach(link => {
      link.classList.toggle("terminal__link--nightmode");
    });
    nightmode.classList.toggle("nightmodeLink--day");
    nightmode.classList.toggle("nightmodeLink--night");

    // * Other Nightmode Changes *
    document
      .querySelector("#terminalInitials")
      .classList.toggle("initials--nightmode");
    document
      .querySelector("#footerInitials")
      .classList.toggle("initials--nightmode");
    document
      .querySelector("#copyright")
      .classList.toggle("initials--nightmode");

    // document.querySelector("footer").classList.toggle(".footer--nightmode");
  }

  // * INITIAL HOME DEMO *
  const homeDemo = function() {
    menu(500);
    setTimeout(() => {
      selectLink(home);
    }, 2500);
  };

  // * RETURN FUNCTIONS - AVAILABLE OUTSIDE FRAMEWORK *
  return {
    menu: menu,
    loadNightmode: loadNightmodeOnFlag,
    homeDemo: homeDemo
  };
};
