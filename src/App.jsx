import React, { useEffect, useState } from "react";
import Overlay from "./europe/Overlay";
import convertState from "./convertState";
import "./index.css";

function App() {
  const [globalState, setGlobalState] = useState({});
  const [config, setConfig] = useState({
    frontend: {
      scoreEnabled: true,
      spellsEnabled: true,
      coachesEnabled: true,
      blueTeam: {
        name: "Team Blue",
        score: 0,
        coach: "",
        color: "#a7ede7",
      },
      redTeam: {
        name: "Team Red",
        score: 0,
        coach: "",
        color: "#793bfe",
      },
      patch: "",
    },
  });

  useEffect(() => {
    window.LPTE.onready(async () => {
      window.LPTE.on("module-league-state", "champselect-update", async (e) => {
        console.log("e", e);
        e.data.isActive = e.isActive;
        e.data.isActive = true;
        e.data.blueTeam.picks = await loadNewPicks(e.data.blueTeam.picks);
        e.data.redTeam.picks = await loadNewPicks(e.data.redTeam.picks);

        setGlobalState(e.data);
      });

      window.LPTE.on("module-teams", "update", updateTeams);

      const themeBlue = document
        .querySelector(":root")
        .style.getPropertyValue("--blue-team");
      const themeRed = document
        .querySelector(":root")
        .style.getPropertyValue("--red-team");

      function updateTeams(e) {
        setConfig({
          frontend: {
            ...config.frontend,
            blueTeam: {
              name: e.teams.blueTeam.name,
              score: e.teams.blueTeam.score,
              coach: e.teams.blueTeam.coach,
            },
            redTeam: {
              name: e.teams.redTeam.name,
              score: e.teams.redTeam.score,
              coach: e.teams.redTeam.coach,
            },
          },
        });
        document
          .querySelector(":root")
          .style.setProperty("--red-team", "#f5f4fd");
        document
          .querySelector(":root")
          .style.setProperty("--blue-team", "#f5f4fd");
        // if (e.teams.blueTeam.color !== "#000000") {
        //   document
        //     .querySelector(":root")
        //     .style.setProperty("--blue-team", e.teams.blueTeam.color);
        // } else {

        // }
        // if (e.teams.redTeam.color !== "#000000") {
        //   document
        //     .querySelector(":root")
        //     .style.setProperty("--red-team", e.teams.redTeam.color);
        // } else {

        // }
      }

      const teams = await window.LPTE.request({
        meta: {
          namespace: "module-teams",
          type: "request-current",
          version: 1,
        },
      });

      if (teams === undefined) return;
      updateTeams(teams);
    });
  }, []);

  const loadNewPicks = async (picks) => {
    let newPicks = await fetch(`http://127.0.0.1:3009/loadriotidsforpuuids`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: JSON.stringify({
        picks,
      }),
    }).then((res) => res.json());

    return newPicks;
  };

  return (
    <div className="App">
      <Overlay state={convertState(globalState)} config={config} />
    </div>
  );
}

export default App;
