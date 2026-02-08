//main_window.html的JS代码

// --- 1. 渲染首页文章列表 ---
async function renderPostList() {
    const listContainer = document.getElementById('post-list');
    if (!listContainer) return; // 如果没有post-list，直接返回

    try {
        const response = await fetch('articels/post_list.json');
        if (!response.ok) throw new Error("无法获取文章列表");
        
        const articles = await response.json();
        
        // 生成 HTML 字符串
        const listHtml = articles.map(post => `
            <article class="post-card">
                <h2>${post.title}</h2>
                <p class="post-meta">发布于 ${post.date}</p>
                <p>${post.excerpt}</p>
                <a href="post_detail.html?name=${post.id}" class="read-more">阅读更多 →</a>
            </article>
        `).join('');

        listContainer.innerHTML = listHtml;
    } catch (error) {
        listContainer.innerHTML = `<p style="color:red;">列表加载失败: ${error.message}</p>`;
    }
}

// 页面加载完成后自动执行
window.addEventListener('DOMContentLoaded', () => {
    console.log("主页已启动！");
    renderPostList();
});