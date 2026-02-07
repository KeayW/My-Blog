// 1. 引入 Marked.js 的 ESM 版本
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

// 2. 渲染 Markdown 的核心函数
async function renderMarkdown() {
    const contentContainer = document.getElementById('content');
    
    // 检查当前页面是否有 ID 为 content 的容器
    if (!contentContainer) {
        console.log("当前页面不需要渲染 Markdown。");
        return;
    }

    try {
        // 获取 Markdown 文件内容（假设文件名为 article.md）
        const response = await fetch('articels/post1.md');
        
        if (!response.ok) {
            throw new Error("无法读取 Markdown 文件，请检查路径。");
        }
        
        const markdownText = await response.text();
        
        // 使用 marked 将文本转换为 HTML 并塞入容器
        contentContainer.innerHTML = marked.parse(markdownText);
        console.log("Markdown 渲染成功！");
    } catch (error) {
        contentContainer.innerHTML = `<p style="color:red;">内容加载出错: ${error.message}</p>`;
    }
}

// 3. 页面加载完成后自动执行
window.addEventListener('DOMContentLoaded', () => {
    console.log("博客模块已启动！");
    renderMarkdown();
});