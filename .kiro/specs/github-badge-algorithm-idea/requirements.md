# Requirements Document

## Introduction

本功能为算法可视化应用的 Header 区域添加两个交互元素：GitHub 徽标（带 Star 数显示和缓存机制）和算法思路按钮。GitHub 徽标位于页面右上角，点击跳转到项目仓库，旁边显示实时 Star 数；算法思路按钮位于 GitHub 徽标左侧，点击弹窗展示当前算法的解题思路。

## Glossary

- **Header**: 页面顶部导航栏组件
- **GitHub_Badge**: GitHub 徽标图标，可点击跳转到仓库
- **Star_Count**: GitHub 仓库的 Star 数量
- **Algorithm_Idea_Button**: 算法思路按钮，点击展示解题思路弹窗
- **Algorithm_Idea_Modal**: 算法思路弹窗，展示当前算法的解题思路
- **IndexedDB_Cache**: 浏览器本地数据库缓存，用于存储 Star 数
- **Cache_Duration**: 缓存有效期，设定为1小时
- **GitHub_API**: GitHub 提供的 REST API，用于获取仓库信息
- **Repository_URL**: 当前项目绑定的 GitHub 仓库地址 (https://github.com/fuck-algorithm/leetcode-128-longest-consecutive-sequence)

## Requirements

### Requirement 1

**User Story:** As a user, I want to see a GitHub badge in the top-right corner of the page, so that I can quickly access the project repository.

#### Acceptance Criteria

1. WHEN the Header component renders THEN the Header SHALL display a GitHub_Badge icon in the top-right corner
2. WHEN a user clicks the GitHub_Badge THEN the Header SHALL open the Repository_URL (https://github.com/fuck-algorithm/leetcode-128-longest-consecutive-sequence) in a new browser tab
3. WHEN a user hovers over the GitHub_Badge THEN the Header SHALL display a tooltip with text "点击去GitHub仓库Star支持一下"

### Requirement 2

**User Story:** As a user, I want to see the repository's Star count next to the GitHub badge, so that I can know the project's popularity.

#### Acceptance Criteria

1. WHEN the Header component mounts THEN the Header SHALL display the Star_Count next to the GitHub_Badge
2. WHEN the IndexedDB_Cache contains valid Star_Count data (within Cache_Duration of 1 hour) THEN the Header SHALL use the cached value without calling GitHub_API
3. WHEN the IndexedDB_Cache is empty or expired THEN the Header SHALL fetch Star_Count from GitHub_API
4. WHEN the GitHub_API request succeeds THEN the Header SHALL save the Star_Count to IndexedDB_Cache with current timestamp
5. WHEN the GitHub_API request fails AND IndexedDB_Cache contains previous Star_Count THEN the Header SHALL display the cached Star_Count
6. WHEN the GitHub_API request fails AND IndexedDB_Cache is empty THEN the Header SHALL display default value 0

### Requirement 3

**User Story:** As a user, I want to click an "Algorithm Idea" button to see the solution approach, so that I can understand the algorithm before or during visualization.

#### Acceptance Criteria

1. WHEN the Header component renders THEN the Header SHALL display an Algorithm_Idea_Button to the left of the GitHub_Badge
2. WHEN a user clicks the Algorithm_Idea_Button THEN the Header SHALL open the Algorithm_Idea_Modal
3. WHEN the Algorithm_Idea_Modal opens THEN the Algorithm_Idea_Modal SHALL display the solution approach for the current algorithm (Longest Consecutive Sequence)
4. WHEN a user clicks outside the Algorithm_Idea_Modal or clicks a close button THEN the Algorithm_Idea_Modal SHALL close
5. WHEN the Algorithm_Idea_Modal is open THEN the Algorithm_Idea_Modal SHALL be centered on the screen with a semi-transparent backdrop

### Requirement 4

**User Story:** As a developer, I want the Star count caching to be reliable and testable, so that the feature works correctly across sessions.

#### Acceptance Criteria

1. WHEN saving Star_Count to IndexedDB_Cache THEN the IndexedDB_Cache SHALL store both the Star_Count value and the timestamp
2. WHEN checking cache validity THEN the IndexedDB_Cache SHALL compare current time with stored timestamp against Cache_Duration (1 hour)
3. WHEN serializing cache data to IndexedDB THEN the IndexedDB_Cache SHALL encode the data as a valid JSON-compatible object
4. WHEN deserializing cache data from IndexedDB THEN the IndexedDB_Cache SHALL decode the data back to the original structure
