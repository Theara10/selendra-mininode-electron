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
  const [confirmPasswd, setConfirmPasswd] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modal, setModal] = useState(false);
  const [passwordValidationMessage, setPasswordValidationMessage] =
    useState("");
  const [nodeNameValidationMessage, setNodeNameValidationMessage] =
    useState("");
  const [status, setStatus] = useState("");
  const [isDone, setIsDone] = useState();
  const [stopNode, setStopNode] = useState();
  const [sessionKey, setSessionKey] = useState("");
  const [loadingNode, setLoadingNode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [stopNodeModal, setStopNodeModal] = useState(false);
  const [restartNodeModal, setRestartNodeModal] = useState(false);

  const [deleteNodePasswdValid, setDeleteNodePasswdValid] = useState(false);
  const [stopNodePasswdValid, setStopNodePasswdValid] = useState(false);

  const checkContainerStatus = useCallback(() => {}, [isDone, loadingNode]);

  // check if node exists
  useEffect(() => {
    window.bridge.getNodeExistStatus((event, args) => {
      var isTrue = JSON.parse(args);
      console.log("exist:", isTrue);
      setIsDone(isTrue);
    });
    window.bridge.getNodeActiveStatus((event, args) => {
      var isTrue = JSON.parse(args);
      setStopNode(isTrue);
    });
  }, [setIsDone, setStopNode]);

  useEffect(() => {
    if (typeof isDone === "undefined") {
      window.bridge.checkIfNodeExist();
    }
    if (typeof stopNode === "undefined") {
      window.bridge.checkNodeActiveStatus();
    }
  });

  // useEffect(() => {
  //   if (status.status === "RUNNING") {
  //     setLoadingNode(false);
  //     // localStorage.setItem("loadingNode", false);
  //     message.success("Your node is running!");

  //     setTimeout(() => {
  //       window.bridge.autoStartContainer();
  //     }, 10000);
  //   }
  // }, [status.status]);

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
        setLoading(false);
      } else {
        setIsDone(true);
        setLoading(false);
        setPasswd("");
        setConfirmPasswd("");
      }
    }, 5000);
  };

  window.bridge.status((event, message) => {
    setStatus(JSON.parse(message));
  });

  // ------Start/Stop/Delete node------

  const stopRunningNode = () => {
    setStopNodeModal(true);
  };

  const confirmStopNode = () => {
    window.bridge.stopNode(confirmPasswd);

    setStopNodeModal(false);
    let stopStatus;
    window.bridge.checkPassword((event, message) => {
      const data = JSON.parse(message);
      stopStatus = data.status;
    });
    setLoading(true);

    setTimeout(() => {
      if (stopStatus === "INVALID") {
        setStopNodePasswdValid(true);
        setLoading(false);
      } else {
        setStopNode(false);
        setLoading(false);
        setConfirmPasswd("");
      }
    }, 5000);
  };

  const restartNode = () => {
    setRestartNodeModal(true);
  };

  const confirmRestartNode = () => {
    window.bridge.restartNode(confirmPasswd);

    let restartStatus;
    window.bridge.checkPassword((event, message) => {
      const data = JSON.parse(message);
      restartStatus = data.status;
    });
    setRestartNodeModal(false);
    setLoading(true);

    setTimeout(() => {
      if (restartStatus === "INVALID") {
        setStopNodePasswdValid(true);
        setLoading(false);
      } else {
        setStopNode(true);
        setLoading(false);
        setConfirmPasswd("");
      }
    }, 5000);
  };

  const deleteNode = () => {
    setModal(true);
  };

  const confirmDeleteNode = (evt) => {
    evt.preventDefault();
    window.bridge.deleteNode(confirmPasswd);
    let a;
    window.bridge.checkPassword((event, message) => {
      const data = JSON.parse(message);
      a = data.status;
    });
    setModal(false);
    setLoading(true);
    setTimeout(() => {
      if (a === "INVALID") {
        setIsDone(true);
        setDeleteNodePasswdValid(true);
        setLoading(false);
      } else {
        setIsDone(false);
        setModal(false);
        localStorage.setItem("isDone", false);
        setLoading(false);
        setConfirmPasswd("");
        message.success("Your node is deleted!");
      }
    }, 5000);
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
              title="Confirm Stop Node!"
              visible={stopNodeModal}
              onCancel={() => setStopNodeModal(false)}
            >
              <Form layout="vertical" size="small">
                <Form.Item label="">
                  <Input.Password
                    className="password-input"
                    placeholder="input password"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                    value={confirmPasswd}
                    onChange={(e) => setConfirmPasswd(e.target.value)}
                  />
                </Form.Item>
                <Form.Item className="ant-form-item-control-input-content">
                  <Button
                    className="ant-btn-block 
                  funan-btnPrimary 
                  funan-btnPrimaryMedium"
                    onClick={confirmStopNode}
                  >
                    Confirm
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
            <Modal
              title="Confirm Delete Node!"
              visible={restartNodeModal}
              onCancel={() => setRestartNodeModal(false)}
            >
              <Form layout="vertical" size="small">
                <Form.Item label="">
                  <Input.Password
                    className="password-input"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                    placeholder="password"
                    value={confirmPasswd}
                    onChange={(e) => setConfirmPasswd(e.target.value)}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    className="ant-btn-block 
                  funan-btnPrimary 
                  funan-btnPrimaryMedium"
                    onClick={confirmRestartNode}
                  >
                    Confirm
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
            <Modal
              title="Confirm Delete Node!"
              visible={modal}
              onCancel={() => setModal(false)}
            >
              <Form layout="vertical" size="small">
                <Form.Item label="">
                  <Input.Password
                    className="password-input"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                    placeholder="password"
                    value={confirmPasswd}
                    onChange={(e) => setConfirmPasswd(e.target.value)}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    className="ant-btn-block 
                  funan-btnPrimary 
                  funan-btnPrimaryMedium"
                    onClick={confirmDeleteNode}
                  >
                    Confirm
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
            <div className="running-node-container">
              <h2>Running the Mininode</h2>
              <p className="my-node-title">My Node</p>
              <Card.Auto className="running-node-card">
                <div className="running-node-box">
                  <p className="node-name">
                    {localStorage.getItem("nodename")}
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
                </div>
              </Card.Auto>
              <div className="validation-message">
                {stopNodePasswdValid && (
                  <Alert message="Incorrect Password!" type="error" showIcon />
                )}
              </div>
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
            <div className="validation-message">
              {deleteNodePasswdValid && (
                <Alert message="Incorrect Password!" type="error" showIcon />
              )}
            </div>
          </>
        )}
      </div>
    </LayoutComponent>
  );
}

export default RunNode;
