// 定义API基础URL
const API_URL = "http://130.147.129.148:8000";

// 获取统计数据
export async function fetchStatistics(filters = {}) {
  const url = new URL(`${API_URL}/statistics`);
  
  // Add filters to statistics request
  Object.entries(filters).forEach(([key, value]) => {
    if (value && Array.isArray(value) && value.length > 0) {
      // For array values, add each item separately with the same key
      value.forEach(item => {
        if (item) {
          url.searchParams.append(key, item);
        }
      });
    } else if (value && !Array.isArray(value)) {
      // For single values
      url.searchParams.append(key, value);
    }
  });
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch statistics");
  }
  return response.json();
}

// 获取投诉列表
export async function fetchComplaints(filters = {}) {
  const url = new URL(`${API_URL}/complaints`);
  
  // FastAPI expects array parameters in format: ?param=value1&param=value2
  Object.entries(filters).forEach(([key, value]) => {
    if (value && Array.isArray(value) && value.length > 0) {
      // For array values, add each item separately with the same key
      value.forEach(item => {
        if (item) {
          url.searchParams.append(key, item);
        }
      });
    } else if (value && !Array.isArray(value)) {
      // For single values
      url.searchParams.append(key, value);
    }
  });
  
  console.log("Request URL:", url.toString()); // Debug log
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch complaints list");
  }
  return response.json();
}

// 上传Excel文件
export async function uploadExcelFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error("File upload failed");
  }
  return response.json();
}

// 更新投诉分类
export async function updateComplaintClassification(prId, classificationData) {
  const response = await fetch(`${API_URL}/complaints/${prId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(classificationData),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update classification");
  }
  return response.json();
}

// AI分类单个投诉
export async function aiClassifyComplaint(prId, modelName = null) {
  const payload = modelName ? { model_name: modelName } : {};
  const response = await fetch(`${API_URL}/complaints/${prId}/classify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    throw new Error("AI classification failed");
  }
  return response.json();
}

// 启动批量自动分类
export async function startAutoClassification(modelName = null) {
  const payload = modelName ? { model_name: modelName } : {};
  const response = await fetch(`${API_URL}/auto-classification/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    throw new Error("Failed to start auto classification");
  }
  return response.json();
}

// 获取自动分类进度
export async function getAutoClassificationProgress() {
  const response = await fetch(`${API_URL}/auto-classification/progress`);
  if (!response.ok) {
    throw new Error("Failed to get classification progress");
  }
  return response.json();
}

// 获取筛选选项
export async function fetchFilterOptions() {
  const response = await fetch(`${API_URL}/filter-options`);
  if (!response.ok) {
    throw new Error("Failed to fetch filter options");
  }
  return response.json();
}

// 获取投诉月度趋势数据
export async function fetchMonthlyTrend(filters = {}) {
  const url = new URL(`${API_URL}/monthly-trend`);
  
  // Add filters to request
  Object.entries(filters).forEach(([key, value]) => {
    if (value && Array.isArray(value) && value.length > 0) {
      value.forEach(item => {
        if (item) {
          url.searchParams.append(key, item);
        }
      });
    } else if (value && !Array.isArray(value)) {
      url.searchParams.append(key, value);
    }
  });
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch monthly trend data");
  }
  return response.json();
}

// 获取按国家统计的数据
export async function fetchCountryStatistics(filters = {}) {
  const url = new URL(`${API_URL}/country-statistics`);
  
  // Add filters to request
  Object.entries(filters).forEach(([key, value]) => {
    if (value && Array.isArray(value) && value.length > 0) {
      value.forEach(item => {
        if (item) {
          url.searchParams.append(key, item);
        }
      });
    } else if (value && !Array.isArray(value)) {
      url.searchParams.append(key, value);
    }
  });
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch country statistics");
  }
  return response.json();
}

// 获取按产品统计的数据
export async function fetchProductStatistics(filters = {}) {
  const url = new URL(`${API_URL}/product-statistics`);
  
  // Add filters to request
  Object.entries(filters).forEach(([key, value]) => {
    if (value && Array.isArray(value) && value.length > 0) {
      value.forEach(item => {
        if (item) {
          url.searchParams.append(key, item);
        }
      });
    } else if (value && !Array.isArray(value)) {
      url.searchParams.append(key, value);
    }
  });
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch product statistics");
  }
  return response.json();
}

// 获取相似投诉
export async function fetchSimilarComplaints(prId, limit = 5) {
  const url = new URL(`${API_URL}/similar-complaints/${prId}`);
  
  // Add limit parameter to control the number of results
  url.searchParams.append('limit', limit);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch similar complaints");
  }
  return response.json();
}

// 获取可用的模型列表
export async function fetchAvailableModels() {
  const url = `${API_URL}/available-models`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch available models");
  }
  return response.json();
}
