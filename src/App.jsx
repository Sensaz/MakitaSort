import { useState } from "react";
import "./App.css";

const rowOrder = "A B C D E F G H I J K L M N O U P Q R S T W Z X V".split(" ");

const shelfMapping = [
  { left: "abcd", right: "yz" },
  { left: "efgh", right: "uvwx" },
  { left: "ijk", right: "rst" },
  { left: "lmn", right: "opq" },
];

const shelfWidth = 10,
  rowSpacing = 20;

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

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

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

function App() {
  const [input, setInput] = useState("");
  const [positions, setPositions] = useState([]);
  const [optimalRouteState, setOptimalRouteState] = useState([]);

  const addPosition = () => {
    const trimmed = input.trim();
    if (trimmed === "") return;
    setPositions([...positions, trimmed]);
    setInput("");
  };

  const sortRoute = () => {
    try {
      const sorted = optimizeRoute(positions);
      setOptimalRouteState(sorted);
    } catch (e) {
      alert(e.message);
    }
  };

  const getRouteIndex = (row, letter) =>
    optimalRouteState.indexOf(row + letter);

  return (
    <div className="app">
      <h1>Magazyn - optymalizacja trasy</h1>

      <div className="warehouse">
        {rowOrder.map((row) => (
          <div key={row} className="warehouse-row">
            <div className="row-label">{row}</div>
            <div className="shelf-row">
              {shelfMapping.map((shelf, shelfIndex) => (
                <div key={shelfIndex} className="shelf-unit">
                  <div className="shelf-top">
                    {shelf.right
                      .split("")
                      .reverse()
                      .map((letter, idx) => {
                        const routeIdx = getRouteIndex(row, letter);
                        return (
                          <div
                            key={idx}
                            className={`shelf-cell top ${
                              routeIdx !== -1 ? "highlight" : ""
                            }`}
                          >
                            {letter}
                            {routeIdx !== -1 && (
                              <span className="order-number">
                                {routeIdx + 1}
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                  <div className="shelf-bottom">
                    {shelf.left.split("").map((letter, idx) => {
                      const routeIdx = getRouteIndex(row, letter);
                      return (
                        <div
                          key={idx}
                          className={`shelf-cell bottom ${
                            routeIdx !== -1 ? "highlight" : ""
                          }`}
                        >
                          {letter}
                          {routeIdx !== -1 && (
                            <span className="order-number">{routeIdx + 1}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="form">
        <input
          type="text"
          value={input}
          placeholder="Wpisz pozycję, np. Aa"
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={addPosition}>Dodaj</button>
        <button onClick={sortRoute}>Przesortuj</button>
      </div>

      {positions.length > 0 && (
        <div className="positions">
          <h2>Wprowadzone pozycje:</h2>
          <p>{positions.join(", ")}</p>
        </div>
      )}

      {optimalRouteState.length > 0 && (
        <div className="route-summary">
          <h2>OPTYMALNA TRASA:</h2>
          <p>{optimalRouteState.join(", ")}</p>
        </div>
      )}
    </div>
  );
}

export default App;
