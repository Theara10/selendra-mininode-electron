import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import LayoutComponent from "../components/Layout";
import { Row, Col, Card } from "antd";
// import bitriel from "../assets/bitriel.png";
import coming from "../assets/coming.png";

function Home() {
  return (
    <LayoutComponent>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "100px",
        }}
      >
        <img src={coming} width="auto" height="300px" />
      </div>
    </LayoutComponent>
  );
}

export default Home;
