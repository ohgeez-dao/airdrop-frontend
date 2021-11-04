import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import "./styles/App.css";
import NFTAirdrop from "./components/NFTAirdrop";
import useEthereum from "./hooks/useEthereum";
import Logo from "./images/logo.png";
import LogoSquared from "./images/logo-squared.gif";
import plumbus from "./data/plumbus.json";
import sharkpunks from "./data/sharkpunks.json";

// FontAwesome library
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { faWallet } from "@fortawesome/free-solid-svg-icons";
library.add(fab, faWallet);

function App() {
  const context = useEthereum();
  return (
    <Router>
      <div className="app">
        <header className={"header-container"}>
          <div className={"header"}>
            <a href={"/"}>
              <img src={Logo} alt={"logo"} width={64} height={64} />
            </a>
            {context.isConnected ? (
              <div className={"connected"}>
                <div className={"dot"} />
                <div>Connected</div>
              </div>
            ) : (
              <button className={"login"} onClick={context.onConnect}>
                Connect Wallet
              </button>
            )}
          </div>
        </header>
        <div className={"body"}>
          <Switch>
            <Route path="/sharkpunks">
              <NFTAirdrop
                data={sharkpunks}
                context={context}
                prev={{ name: "Plumbus", path: "/" }}
              />
            </Route>
            <Route path="/">
              <NFTAirdrop
                data={plumbus}
                context={context}
                next={{ name: "Sharkpunks", path: "/sharkpunks" }}
              />
            </Route>
          </Switch>
        </div>
        <div className={"border"} />
        <footer>
          <img src={LogoSquared} alt={"logo"} width={96} height={96} style={{
            borderRadius: '50%'
          }} />
          <div className={"social"}>
            <a href={"https://twitter.com/LevXDAOhGeez"} target={"_blank"}>
              <FontAwesomeIcon icon={["fab", "twitter"]} />
            </a>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <a href={"https://discord.gg/oh-geez"} target={"_blank"}>
              <FontAwesomeIcon icon={["fab", "discord"]} />
            </a>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <a href={"https://blog.levx.io"} target={"_blank"}>
              <FontAwesomeIcon icon={["fab", "medium"]} />
            </a>
          </div>
          <div className={"copyright"}>
            Built by{" "}
            <a href={"https://twitter.com/LevxApp"} target={"_blank"}>
              LevX
            </a>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
