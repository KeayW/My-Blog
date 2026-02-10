//pos_detail的JS代码

import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';//引入 Marked.js 的 ESM 版本
import hljs from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/es/highlight.min.js';// 引入 highlight.js 的 ESM 版本

/**
 * 1. 启动函数：负责“找东西”  是通过url名称去寻找对应id的json类标签  （url => json.id）
 */
async function initPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('name');// 从 URL 获取文章 ID
    
    if (!postId) {
        window.location.href = 'main_window.html'; // 没 ID 就跳回首页
        return;
    }

    try {
        const response = await fetch('articels/post_list.json');
        const articles = await response.json();
        const postInfo = articles.find(a => a.id === postId);

        if (!postInfo) {
            throw new Error("在列表里没找到这篇文章喔");
        }

        // 设置页面的基本信息（标题、日期）
        document.getElementById('post-title').innerText = postInfo.title;
        document.getElementById('post-date').innerText = `发布于 ${postInfo.date}`;

        // 进入分发环节
        renderDispatcher(postInfo);

    } catch (error) {
        document.getElementById('content').innerHTML = `<p style="color:red;">初始化失败: ${error.message}</p>`;
    }
}

/**
 * 2. 渲染分发器：负责“根据类型分配任务”
 */
function renderDispatcher(postInfo) {
    const container = document.getElementById('content');
    
    // 清除可能存在的旧样式类
    container.className = ''; 

    switch (postInfo.type) {
        case 'md':
            displayMarkdown(postInfo.file || `articels/${postInfo.id}.md`, container);
            break;
        case 'html':
            displayHtml(postInfo.file || `articels/${postInfo.id}.html`, container);
            break;
        case 'game':
            displayGame(postInfo, container);
            break;
        default:
            container.innerHTML = `<p style="color:orange;">暂不支持的类型: ${postInfo.type}</p>`;
    }
}

/**
 * 3. 专门渲染函数：各自独立工作
 */

// 渲染 Markdown
async function displayMarkdown(filePath, container) {
    try {
        const response = await fetch(filePath);
        const text = await response.text();
        container.classList.add('markdown-body'); // 按需添加样式
        container.innerHTML = marked.parse(text);
        container.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
    } catch (e) {
        container.innerHTML = "Markdown 加载失败";
    }
}

// 渲染原生 HTML
async function displayHtml(filePath, container) {
    try {
        const response = await fetch(filePath);
        container.innerHTML = await response.text();
    } catch (e) {
        container.innerHTML = "HTML 加载失败";
    }
}

// 渲染小游戏
function displayGame(postInfo, container) {
   container.innerHTML = ''; // 清空内容

    //动态加载JS
    if (postInfo.file) {
        const script = document.createElement('script');
        script.src = postInfo.file;
        script.onerror = () => {
            container.innerHTML = '<p style="color:red;">游戏脚本加载失败</p>';
        };
        document.body.appendChild(script);
    } else {
        container.innerHTML = '<p style="color:red;">未配置游戏脚本路径</p>';
    }
}

// 执行初始化
window.addEventListener('DOMContentLoaded', initPage);