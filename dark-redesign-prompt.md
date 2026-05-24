# 任务：重新设计 MockupShot 暗色模式配色 + 修复 CSS 结构

## 项目位置
/home/wu/projects/mockupshot/

## 需要修改的文件
/home/wu/projects/mockupshot/css/style.css（约1290行）

## 问题
1. **[data-theme="dark"] { :root { ... } }** 是无效嵌套 CSS，浏览器完全忽略 :root 内的 CSS 变量
2. **选择器特异性不足** — :root (0-1-0) 和 [data-theme="dark"] (0-1-0) 相同，:root 在前覆盖
3. **大量硬编码色值** — #1F2937, #374151, #111827, #9CA3AF 等替换为 CSS 变量
4. **配色粗糙** — 只有灰蓝调，没有品牌特色

## 修复方案

### 改动1：CSS 结构重构

将：
```css
[data-theme="dark"] {
    :root {
        --text-color: #F9FAFB;
        --bg-color: #111827;
        ...
    }
    .header { ... }
    .upload-area { ... }
}
```

改为：
```css
html[data-theme="dark"] {
    --text-color: #ECFDF5;
    --bg-color: #0B1920;
    ...
}

html[data-theme="dark"] .header { ... }
html[data-theme="dark"] .upload-area { ... }
```

### 改动2：变量调整

| 旧变量 | 旧值 | 新变量 | 新值 |
|---|---|---|---|
| --text-color | #F9FAFB | --text-color | #ECFDF5（极浅绿白） |
| --text-secondary | #D1D5DB | --text-secondary | #94A3B8（柔灰） |
| --border-color | #374151 | --border-color | #1a3a3a（深绿灰边框） |
| --bg-color | #111827 | --bg-color | #0B1920（深墨绿黑） |
| --white | #1F2937 | **删除**，改为 --bg-secondary | #0F2328（深绿灰卡片） |
| --primary-color | #10B981 | --primary-color | #34D399（浅翠绿，暗色用亮版） |
| --primary-dark | #059669 | --primary-dark | #10B981（亮色主色作为暗色的 primary-dark） |
| --primary-light | #34D399 | --primary-light | #6EE7B7（更浅用于 hover） |
| --shadow-* | 黑色 rgba | --shadow-* | 使用 rgba(255,255,255, 0.03) 风格 |

### 改动3：所有硬编码色值替换为 CSS 变量

搜索替换规则（在 [data-theme="dark"] 块内）：
- 所有硬编码 `#1F2937` → `var(--bg-secondary)`
- 所有硬编码 `#374151` → `var(--border-color)`
- 所有硬编码 `#111827` → `var(--bg-color)`
- 所有硬编码 `#9CA3AF` → `var(--text-secondary)`
- 所有硬编码 `#F9FAFB` → `var(--text-color)`
- 所有硬编码 `rgba(16, 185, 129, 0.1)` → `rgba(52, 211, 153, 0.1)`（用新 primary-light）
- 所有硬编码 `rgba(16, 185, 129, 0.2)` → `rgba(52, 211, 153, 0.2)`

这样每个元素的暗色样式都通过 CSS 变量获取值，将来改配色只需改变量。

### 改动4：Header 样式升级

```css
html[data-theme="dark"] .header {
    background: rgba(15, 35, 40, 0.85);
    border-bottom: 1px solid var(--border-color);
    backdrop-filter: blur(12px);
}
```

### 改动5：Upload area 升级

```css
html[data-theme="dark"] .upload-area {
    background: rgba(15, 35, 40, 0.6);
    border-color: var(--border-color);
}

html[data-theme="dark"] .upload-area:hover {
    background: rgba(52, 211, 153, 0.08);
    border-color: var(--primary-color);
}
```

### 改动6：Theme toggle hover 兼容

```css
html[data-theme="dark"] .theme-toggle:hover {
    background-color: var(--bg-secondary);
}
```

## 不要改动
1. 亮色模式 :root（第1-20行）完全不动
2. 所有 HTML 文件不修改
3. JS 不修改
4. 其他 CSS 文件不修改

## 验证
修改后用 Chrome 浏览器打开 https://mockupshot.online/，点击暗色切换按钮检查背景色是否为深墨绿色。
