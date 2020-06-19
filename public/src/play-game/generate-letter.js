// getLetter event callback
export function pickALetter(e) {
  const el = e.currentTarget;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letter = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  el.textContent = letter;
  el.classList.add("large");
}
