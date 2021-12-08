import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import "./styles/App.css";
import NFTAirdrop from "./components/NFTAirdrop";
import useEthereum from "./hooks/useEthereum";
import Logo from "./images/logo.png";
import LogoSquared from "./images/logo-squared.gif";
import plumbus from "./data/plumbus.json";
import sharkpunks from "./data/sharkpunks.json";
import sharkpunks750 from "./data/sharkpunks750.json";
import maidAvatars from "./data/maid-avatars.json";

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
            <Route path="/plumbus">
              <NFTAirdrop
                data={plumbus}
                context={context}
                prev={{ name: "333 Sharkpunks for OGs", path: "/sharkpunks" }}
              />
            </Route>
            <Route path="/sharkpunks">
              <NFTAirdrop
                data={sharkpunks}
                context={context}
                next={{ name: "Plumbus", path: "/plumbus" }}
                prev={{
                  name: "750 Sharkpunks Raffled",
                  path: "/sharkpunks750",
                }}
              />
            </Route>
            <Route exact path="/sharkpunks750">
              <NFTAirdrop
                data={sharkpunks750}
                context={context}
                next={{ name: "333 Sharkpunks for OGs", path: "/sharkpunks" }}
                prev={{ name: "Maid Avatars", path: "/" }}
              />
            </Route>
            <Route exact path="/">
              <NFTAirdrop
                data={maidAvatars}
                context={context}
                next={{
                  name: "750 Sharkpunks Raffled",
                  path: "/sharkpunks750",
                }}
              />
            </Route>
            <Redirect to="/" />
          </Switch>
        </div>
        <div className={"border"} />
        <footer>
          <img src={LogoSquared} alt={"logo"} width={96} height={96} />
          <div className={"social"}>
            <a href={"https://twitter.com/LevXDAOhGeez"} target={"_blank"}>
              Twitter
            </a>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <a href={"https://discord.gg/oh-geez"} target={"_blank"}>
              Discord
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
