// Zapis tablicy rzędów oraz mapowania regałów
const rowOrder = "A B C D E F G H I J K L M N O U P Q R S T W Z X V".split(" ");
const shelfMapping = [
  { left: "abcd", right: "yz" },
  { left: "efgh", right: "uvwx" },
  { left: "ijk", right: "rst" },
  { left: "lmn", right: "opq" },
];
const shelfWidth = 10,
  rowSpacing = 20;

// Funkcja parsująca kod lokalizacji (np. "Aa", "Bn")
function parseLocation(locCode) {
  if (locCode.length < 2)
    throw new Error(`Nieprawidłowy kod lokalizacji: ${locCode}`);
  const row = locCode[0],
    letter = locCode.slice(1).toLowerCase(),
    rowIndex = rowOrder.indexOf(row);
  if (rowIndex === -1) throw new Error(`Nieznany rząd: ${row}`);
  for (let shelfUnit = 0; shelfUnit < shelfMapping.length; shelfUnit++) {
    let pos = shelfMapping[shelfUnit].left.indexOf(letter);
    if (pos !== -1) return { row, rowIndex, shelfUnit, side: 0, pos, letter };
    pos = shelfMapping[shelfUnit].right.indexOf(letter);
    if (pos !== -1) return { row, rowIndex, shelfUnit, side: 1, pos, letter };
  }
  throw new Error(
    `Litera ${letter} nie została znaleziona w żadnym regale dla kodu ${locCode}`
  );
}

// Funkcja wyznaczająca współrzędne punktu na podstawie obiektu lokalizacji
function getCoordinates(loc) {
  const baseX = loc.shelfUnit * shelfWidth,
    group = shelfMapping[loc.shelfUnit][loc.side === 0 ? "left" : "right"],
    portion = (loc.pos + 1) / (group.length + 1),
    xOffset =
      loc.side === 0
        ? portion * (shelfWidth / 2)
        : shelfWidth / 2 + portion * (shelfWidth / 2);
  return { x: baseX + xOffset, y: loc.rowIndex * rowSpacing };
}

// Funkcja obliczająca euklidesową odległość między punktami
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Algorytm optymalizacji trasy (heurystyka najbliższego sąsiada)
function optimizeRoute(codes) {
  const locations = codes.map((code) => {
    const loc = parseLocation(code);
    return { code, ...loc, coords: getCoordinates(loc) };
  });
  let [current, ...unvisited] = locations,
    route = [current];
  while (unvisited.length) {
    let nearestIndex = 0,
      nearestDist = Infinity;
    unvisited.forEach((loc, i) => {
      const d = distance(current.coords, loc.coords);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIndex = i;
      }
    });
    current = unvisited.splice(nearestIndex, 1)[0];
    route.push(current);
  }
  return route.map((loc) => loc.code);
}

// Przykładowe dane i uruchomienie algorytmu
const WZ = ["Aa", "Ac", "Ak", "An", "Bd", "Bn"];
console.log("Optymalna trasa zbiórki:", optimizeRoute(WZ).join(", "));
