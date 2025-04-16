
module.exports = {
    root: true,  // 标记为根配置，防止ESLint查找其他配置
    extends: ["react-app"],
    plugins: ["react"],
    settings: {
      react: {
        version: "detect"  // 自动检测React版本
      }
    },
    rules: {
      // 任何你想要自定义的规则
    }
  };
  