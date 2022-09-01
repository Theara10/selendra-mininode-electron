import React, { useState } from "react";
import {
  Button,
  Card,
  message,
} from "antd";

function MyNode() {
  const [stopNode, setStopNode] = useState(true);
  const [sessionKey, setSessionKey] = useState("");

  const stopRunningNode = () => {
    window.bridge.stopNode();
    setStopNode(!stopNode);
  };

  const restartNode = () => {
    window.bridge.restartNode();
    setStopNode(!stopNode);
  };
  window.bridge.sendSessionKey((event, message) => {
    const key = JSON.parse(message);
    setSessionKey(key.result);
  });

  return (
    <div>
      <div className="running-node-container">
        {/* {message.success("This is a success message")} */}
        <h2>Running the Mininode</h2>
        <Card className="running-node-card">
          <p>My Node</p>
          <div className="running-node-box">
            <p>
              <strong>{localStorage.getItem("nodename")}</strong>
            </p>

            <div className="running-node-box-right">
              {stopNode ? (
                <>
                  <div className="node-status">
                    <p className="node-active">Active</p>
                  </div>
                  <div
                    className="running-node-button secondary-btn"
                    onClick={stopRunningNode}
                  >
                    <div className="stop_icon"></div>
                    <p>Stop Running</p>
                  </div>
                </>
              ) : (
                // <Button onClick={restartNode}>Restart Node</Button>
                <>
                  <div className="node-status">
                    <p className="node-inactive">Inactive</p>
                  </div>
                  <div
                    className="running-node-button secondary-btn"
                    onClick={restartNode}
                  >
                    <div className="stop_icon"></div>
                    <p>Restart Node</p>
                  </div>
                </>
              )}

              <a
                href="https://telemetry.polkadot.io/#list/0x3d7efe9e36b20531f2a735feac13f3cad96798b2d9036a6950dac8076c19c545"
                target="_blank"
              >
                {/* <img src={sel} width="auto" height="30px" /> */}
              </a>
            </div>
          </div>
        </Card>
        <Button
          style={{
            marginTop: "10px",
            backgroundColor: "#03a9f4",
            borderRadius: "10px",
            color: "white",
          }}
        >
          {/* <Link to="/validate/bonding">{`-> Continue to Validate`}</Link> */}
        </Button>
      </div>

      <Card className="running-node-card">
        <Button
          onClick={() => {
            window.bridge.getSessionKey("hi");
          }}
          className="secondary-btn"
        >
          Get Session Key
        </Button>
        {sessionKey && (
          <div className="session-key-container">
            <p className="session-key">{sessionKey}</p>
            <div className="session-key-icon">
              <CopyOutlined
                className="copy-icon"
                onClick={() => {
                  navigator.clipboard.writeText(sessionKey);
                  message.success("Copied to clipboard!");
                }}
              />
              <CloseOutlined
                onClick={() => {
                  setSessionKey("");
                }}
              />
            </div>
          </div>
        )}
      </Card>
      <div style={{ marginTop: "40px" }}>
        <Button
          className="secondary-btn"
          onClick={() => {
            setIsDone(false);
            localStorage.setItem("isDone", false);
            setIsStatusModelVisible(false);
            window.bridge.stopNode();
            // window.bridge.deleteNode();
          }}
        >
          Delete Node
        </Button>
      </div>
    </div>
  );
}

export default MyNode;
