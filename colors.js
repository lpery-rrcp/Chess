function chooseStartingColor(colorPreference) {
  if (typeof colorPreference !== "string") {
    return "white";
  }

  const normalized = colorPreference.trim().toLowerCase();
  if (normalized === "black" || normalized === "b") {
    return "black";
  }

  return "white";
}
