export function wait(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function destroyPopup(popup) {
  popup.classList.remove("open");
  await wait(1000);
  // remove the popup entirely!
  popup.remove();
  /* eslint-disable no-param-reassign */
  popup = null;
  /* eslint-enable no-param-reassign */
}

// create a popup for buttons, using options {options.class, .text, .value}
export function ask(options) {
  return new Promise(async function (resolve) {
    // First we need to create a popup with all the fields in it
    const popup = document.createElement("div");
    // const popupText = document.createElement("p");
    // popupText.textContent = options.textContent;
    const inner = document.createElement("div");
    inner.innerHTML = options.textContent;
    options.buttons.map((button) => {
      //console.log(button);
      const el = document.createElement("button");
      el.classList.add(button.class);
      el.type = "button";
      el.textContent = button.text;
      el.dataset.value = button.data;
      inner.appendChild(el);
    });

    popup.appendChild(inner);
    popup.classList.add("popup");
    // insert the popup into the DOM
    document.body.appendChild(popup);
    const popupButtons = document.querySelectorAll(".popup button");

    // listen for the submit event on the buttons, resolve the data-value
    popupButtons.forEach((button) => {
      button.addEventListener(
        "click",
        function (e) {
          e.preventDefault();
          resolve(e.target.dataset.value);
          // remove it from the DOM entirely
          destroyPopup(popup);
        },
        { once: true }
      );
    });

    // put a very small timeout before we add the open class for animation to work
    await wait(50);
    popup.classList.add("open");
  });
}
