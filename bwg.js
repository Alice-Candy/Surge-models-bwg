// === 主面板脚本 (最终精简版) ===

// 从 persistent store 读取之前存储的 URL
const url = $persistentStore.read("api_url");

// 检查 URL 是否存在
if (!url) {
  // 如果 URL 不存在，调用 $done 结束脚本并显示错误
  $done({
    title: "BWG Info - 错误",
    content: "未找到 API URL，请先运行一次性脚本存储 URL",
    icon: 'xmark.circle.fill',
    'icon-color': '#ff0000',
  });
} else {
  // 如果 URL 存在，才执行网络请求
  $httpClient.get(url, (error, response, data) => {
    // 1. 网络错误处理
    if (error || response.status !== 200) {
      console.log(`HTTP 请求错误: ${error || `状态码 ${response.status}`}`);
      return $done({
        title: "BWG Info - 更新失败",
        content: "无法连接服务器，请检查网络或配置",
        icon: 'wifi.exclamationmark',
        'icon-color': '#ffcc00',
      });
    }

    try {
      const result = JSON.parse(data);

      // 2. API 返回错误处理
      if (result.error !== 0) {
        console.log(`API 返回错误: ${result.error}`);
        return $done({
          title: "BWG Info - API 错误",
          content: `API 返回错误码: ${result.error}`,
          icon: 'exclamationmark.triangle.fill',
          'icon-color': '#ff0000',
        });
      }

      // 3. 提取和计算流量数据
      const bwLimit = result.plan_monthly_data;
      const bwUsed = result.data_counter;
      const resetTimestamp = result.data_next_reset;

      const totalGB = bwLimit / (1024 * 1024 * 1024);
      const usedGB = bwUsed / (1024 * 1024 * 1024);
      const remainingGB = totalGB - usedGB;

      // 4. 处理日期和时间
      const resetDate = new Date(resetTimestamp * 1000);
      const nextResetDateStr = `${resetDate.getMonth() + 1}月${resetDate.getDate()}日`;

      // 5. 组装面板内容
      const panel = {
        title: '✈️ 𝘽𝙒𝙂 𝙄𝙣𝙛𝙤',
        // 面板内容已按要求精简
        content: `已用流量: ${usedGB.toFixed(2)} GB\n` +
                 `剩余流量: ${remainingGB.toFixed(2)} GB\n` +
                 `重置日期: ${nextResetDateStr}`,
        icon: 'server.rack',
        'icon-color': '#000000', 
      };

      $done(panel);

    } catch (parseError) {
      console.log(`JSON 解析错误: ${parseError}`);
      $done({
        title: "BWG Info - 解析失败",
        content: "无法解析服务器返回的数据",
        icon: 'exclamationmark.triangle.fill',
        'icon-color': '#ff0000',
      });
    }
  });
}
