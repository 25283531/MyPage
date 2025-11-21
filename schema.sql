-- 创建分组表
CREATE TABLE Groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    order_num INTEGER DEFAULT 0,
    is_private BOOLEAN DEFAULT FALSE,
    bg_color TEXT,
    bg_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建链接表
CREATE TABLE Links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    logo TEXT,
    description TEXT,
    group_id INTEGER,
    order_num INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES Groups(id) ON DELETE CASCADE
);

CREATE TABLE Settings (
    id INTEGER PRIMARY KEY,
    page_bg_color TEXT,
    page_bg_image TEXT,
    nav_bg_color TEXT,
    nav_bg_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Settings (id, page_bg_color, page_bg_image, nav_bg_color, nav_bg_image)
VALUES (1, NULL, NULL, NULL, NULL);