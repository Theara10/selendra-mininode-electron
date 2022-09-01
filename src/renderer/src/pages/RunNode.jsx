import React, { useState, useEffect, useCallback } from "react";
import "../App.css";
import {
  Button,
  Spin,
  Modal,
  Input,
  Form,
  message,
  Alert,
  Popover,
} from "antd";
import {
  CopyOutlined,
  CloseOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import sel from "../assets/sel-icon.svg";

import LayoutComponent from "../components/Layout";
import Card from "../components/Card";

function RunNode() {
  const [name, setName] = useState("");
  const [passwd, setPasswd] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [passwordValidationMessage, setPasswordValidationMessage] =
    useState("");
  const [nodeNameValidationMessage, setNodeNameValidationMessage] =
    useState("");
  const [status, setStatus] = useState("");
  const [isDone, setIsDone] = useState();
  const [stopNode, setStopNode] = useState(true);
  const [sessionKey, setSessionKey] = useState("");
  const [loadingNode, setLoadingNode] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkContainerStatus = useCallback(() => {}, [isDone, loadingNode]);

  useEffect(() => {
    window.bridge.getNodeActiveStatus((event, args) => {
      var isTrue = JSON.parse(args);
      setIsDone(isTrue);
      // setLoadingNode(localStorage.getItem("loadingNode"));
    });
  }, [setIsDone, setLoadingNode]);

  useEffect(() => {
    if (typeof isDone === "undefined") {
      // checkContainerStatus();
      window.bridge.checkNodeActiveStatus();
    }
  }, [isDone]);

  useEffect(() => {
    if (status.status === "RUNNING") {
      setLoadingNode(false);
      // localStorage.setItem("loadingNode", false);
      message.success("Your node is running!");

      setTimeout(() => {
        window.bridge.autoStartContainer();
      }, 10000);
    }
  }, [status.status]);

  const handleSubmit = (evt) => {
    evt.preventDefault();
    setIsModalVisible(true);
    // setValidationMessage("");

    if (name === "") {
      setIsModalVisible(false);
      setNodeNameValidationMessage("Node name can't be empty!");
    }
  };

  const handlePasswd = async (evt) => {
    evt.preventDefault();
    window.bridge.sendNodeName(name);
    window.bridge.sendPassword(passwd);

    setIsModalVisible(false);
    localStorage.setItem("nodename", name);
    let status;
    window.bridge.checkPassword((event, message) => {
      const data = JSON.parse(message);
      setPasswordValidationMessage(data.status);
      status = data.status;
    });
    setLoading(true);
    setTimeout(() => {
      if (status === "INVALID") {
        setIsDone(false);
      } else {
        setIsDone(true);
        setLoadingNode(true);
      }
      setLoading(false);
    }, 5000);

    setName("");
    setPasswd("");
  };

  window.bridge.status((event, message) => {
    setStatus(JSON.parse(message));
  });

  const stopRunningNode = () => {
    window.bridge.stopNode();
    setStopNode(!stopNode);
  };

  const restartNode = () => {
    window.bridge.restartNode();
    setStopNode(!stopNode);
  };

  const deleteNode = () => {
    localStorage.setItem("isDone", false);
    window.bridge.deleteNode();
    setIsDone(false);
    localStorage.removeItem("loadingNode");
    message.success("Your node is deleted!");
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  window.bridge.sendSessionKey((event, message) => {
    const key = JSON.parse(message);
    setSessionKey(key.result);
  });

  return (
    <LayoutComponent>
      <div className="App">
        {!isDone && (
          <>
            <Modal
              className="loading-modal"
              visible={loading}
              // onCancel={handleCancel}
              closable={false}
            >
              <div className="loading-modal-container">
                <Spin />
                <p>Loading..!</p>
              </div>
            </Modal>
            <Modal
              title="Enter your computer password to confirm!"
              visible={isModalVisible}
              onCancel={handleCancel}
            >
              <Form layout="vertical" size="small">
                <Form.Item label="">
                  <Input.Password
                    className="password-input"
                    // className="ant-input funan-input funan-inputMedium"
                    placeholder="input password"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                    value={passwd}
                    onChange={(e) => setPasswd(e.target.value)}
                  />
                </Form.Item>
                <Form.Item
                  label=""
                  className="ant-form-item-control-input-content"
                >
                  <Button
                    className="ant-btn-block 
                  funan-btnPrimary 
                  funan-btnPrimaryMedium"
                    onClick={handlePasswd}
                  >
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </Modal>

            <div className="running-node-container">
              <h2>Prepare Selendra on the Mininode</h2>

              <Card.Auto style={{ borderRadius: "8px", marginTop: 20 }}>
                <Form layout="vertical" size="large">
                  <Form.Item label="Name your node">
                    <Input
                      className="ant-input funan-input funan-inputMedium"
                      placeholder="my-first-selendra-node"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Form.Item>
                  {passwordValidationMessage && (
                    <Alert
                      message="Incorrect Password!"
                      type="error"
                      showIcon
                    />
                  )}
                  {nodeNameValidationMessage && (
                    <Alert
                      message="Node's name can not be empty!"
                      type="error"
                      showIcon
                    />
                  )}
                  <Form.Item className="ant-form-item-control-input-content">
                    <Button
                      className="ant-btn-block funan-btnPrimary funan-btnPrimaryMedium"
                      onClick={handleSubmit}
                    >
                      Run Node
                    </Button>
                  </Form.Item>
                </Form>
              </Card.Auto>
            </div>
          </>
        )}
        {isDone && (
          <div>
            <div className="running-node-container">
              <h2>Running the Mininode</h2>
              <p className="my-node-title">My Node</p>
              <Card.Auto className="running-node-card">
                <div className="running-node-box">
                  <p className="node-name">
                    {localStorage.getItem("nodename")}
                  </p>
                  {loadingNode ? (
                    <div style={{ display: "flex" }}>
                      <Spin style={{ marginRight: "10px" }} />
                      <p>Preparing your node!</p>
                    </div>
                  ) : (
                    //running node box
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
                            <p className="text">Stop Running</p>
                          </div>
                        </>
                      ) : (
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
                      <Popover content="Node's Details">
                        <a
                          href="https://telemetry.polkadot.io/#list/0x779c945be9025d1fc27e7fc0235ff4f1b062c93e2c455f3e0d4f919d12f8c817"
                          target="_blank"
                        >
                          <img src={sel} width="auto" height="30px" />
                        </a>
                      </Popover>
                    </div>
                  )}
                </div>
              </Card.Auto>
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

            <Card.Auto className="running-node-card">
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
                        message.success("Session key copied!!");
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
            </Card.Auto>
            <div style={{ marginTop: "40px" }}>
              <Button className="secondary-btn" onClick={() => deleteNode()}>
                Delete Node
              </Button>
            </div>
          </div>
        )}
      </div>
    </LayoutComponent>
  );
}

export default RunNode;
