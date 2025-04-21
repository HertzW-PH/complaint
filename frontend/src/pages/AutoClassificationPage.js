import React, { useState, useEffect } from "react";
import { startAutoClassification, getAutoClassificationProgress, fetchAvailableModels } from "../utils/api";
import { Loader2 } from "lucide-react";

export default function AutoClassificationPage() {
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [isClassifying, setIsClassifying] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [error, setError] = useState(null);

  // 获取可用模型列表
  useEffect(() => {
    const loadModels = async () => {
      setIsLoadingModels(true);
      try {
        const result = await fetchAvailableModels();
        if (result.status === "success") {
          setModels(result.models || []);
          // 如果有模型，则默认选择第一个
          if (result.models && result.models.length > 0) {
            setSelectedModel(result.models[0].name);
          }
        } else {
          setError(result.message || "无法加载模型列表");
        }
      } catch (error) {
        console.error("加载模型列表出错:", error);
        setError("加载模型列表时发生错误");
      } finally {
        setIsLoadingModels(false);
      }
    };

    loadModels();
  }, []);

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
  };

  const startClassification = async () => {
    setIsClassifying(true);
    setError(null);
    setProgress({ completed: 0, total: 1 }); // 初始化进度

    try {
      // 使用选择的模型启动自动分类
      await startAutoClassification(selectedModel);
      
      // 定期检查进度
      const interval = setInterval(async () => {
        try {
          const progressData = await getAutoClassificationProgress();
          setProgress(progressData);
          
          // 如果完成了所有分类，停止检查
          if (progressData.completed >= progressData.total) {
            clearInterval(interval);
            setIsClassifying(false);
          }
        } catch (err) {
          console.error("获取分类进度失败:", err);
          clearInterval(interval);
          setError("获取分类进度失败");
          setIsClassifying(false);
        }
      }, 2000); // 每2秒检查一次进度
    } catch (err) {
      console.error("启动自动分类失败:", err);
      setError("启动自动分类失败");
      setIsClassifying(false);
    }
  };

  // 计算进度百分比
  const progressPercentage = progress.total > 0 
    ? Math.round((progress.completed / progress.total) * 100) 
    : 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">自动分类</h1>
      
      {/* 模型选择 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">选择模型</h2>
        
        {isLoadingModels ? (
          <div className="flex items-center text-gray-500">
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            加载模型列表中...
          </div>
        ) : error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <>
            <select
              value={selectedModel || ''}
              onChange={handleModelChange}
              className="block w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isClassifying}
            >
              {models.length === 0 ? (
                <option value="">无可用模型</option>
              ) : (
                models.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name}
                  </option>
                ))
              )}
            </select>
            
            {selectedModel && (
              <div className="mt-2 text-sm text-gray-600">
                已选择模型: <span className="font-medium">{selectedModel}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* 开始分类按钮 */}
      <div className="mb-6">
        <button
          onClick={startClassification}
          disabled={isClassifying || !selectedModel || models.length === 0}
          className={`px-4 py-2 text-white rounded-md shadow-sm ${
            isClassifying || !selectedModel || models.length === 0 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-blue-500 hover:bg-blue-600"
          } flex items-center`}
        >
          {isClassifying ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              分类中...
            </>
          ) : (
            "开始自动分类"
          )}
        </button>
      </div>

      {/* 进度条 */}
      {(isClassifying || progressPercentage > 0) && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">分类进度</h2>
          <div className="w-full bg-gray-200 rounded-full h-5 dark:bg-gray-700 mb-2">
            <div
              className="bg-blue-500 h-5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            已完成 {progress.completed} / {progress.total} ({progressPercentage}%)
          </p>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
