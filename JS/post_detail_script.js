//pos_detail的JS代码

import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';//引入 Marked.js 的 ESM 版本
import hljs from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/es/highlight.min.js';// 引入 highlight.js 的 ESM 版本


//渲染 Markdown 的核心函数
async function renderMarkdown() {
    const contentContainer = document.getElementById('content');
    
    // 检查当前页面是否有 ID 为 content 的容器
    if (!contentContainer) {
        return;
    }

    // 例如：post_detail.html?name=post1
    const urlParams = new URLSearchParams(window.location.search);
    const postName = urlParams.get('name') || 'post_noting'; // 如果没有参数，默认加载 post_noting
    const postPath = `articels/${postName}.md`;

    try {
        // 获取 Markdown 文件内容
        const response = await fetch(postPath);
        
        if (!response.ok) {
            throw new Error(`无法找到文章 "${postName}"，请检查文件路径。`);
        }
        
        const markdownText = await response.text();

        // 使用 marked 将文本转换为 HTML 并塞入容器
        contentContainer.innerHTML = marked.parse(markdownText);
        
        // 使用 highlight.js 高亮代码块
        contentContainer.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        }); 

        console.log(`文章 "${postName}" 渲染成功！`);
    } catch (error) {
        contentContainer.innerHTML = `<p style="color:red;">内容加载出错: ${error.message}</p>`;
    }
}

// 页面加载完成后自动执行
window.addEventListener('DOMContentLoaded', () => {
    console.log("文章详情页已启动！");
    renderMarkdown();
});