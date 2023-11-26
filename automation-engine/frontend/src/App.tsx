import React from "react";

export default function App() {
  const [state, setState] = React.useState("");

  const onclick = async (action: "start"|"stop"|"list") => {
    const result = await fetch(`api/${action}`);
    setState(await result.text());
  };

  return (
    <div className="App">
      <button onClick={()=>onclick("start")}>Start</button>
      <button onClick={()=>onclick("stop")}>Stop</button>
      <button onClick={() => onclick("list")}>List</button>
      <div style={{fontFamily: "monospace"}}>{state}</div>
    </div>
  );
}
