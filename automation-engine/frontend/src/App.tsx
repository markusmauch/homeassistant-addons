import React from "react";

export default function App() {
  const onClick = async () => {
    const result = await fetch("api/hello");
    alert(await result.text());
  };

  return (
    <div className="App">
      <button onClick={onClick}>Load</button>
    </div>
  );
}
