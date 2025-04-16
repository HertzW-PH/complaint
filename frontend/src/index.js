
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// 引入全局样式
import "./index.css";

// 获取根DOM节点
const container = document.getElementById("root");
const root = createRoot(container);

// 渲染应用
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
