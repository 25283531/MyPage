CREATE TABLE IF NOT EXISTS Groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    bg_color TEXT,
    bg_image TEXT,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    logo TEXT,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES Groups(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Settings (
    id INTEGER PRIMARY KEY,
    page_bg_color TEXT,
    page_bg_image TEXT,
    nav_bg_color TEXT,
    nav_bg_image TEXT,
    theme_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Settings (id, page_bg_color, page_bg_image, nav_bg_color, nav_bg_image, theme_json)
VALUES (1, '#F5F5F5', NULL, '#FFFFFF', NULL, '{"primary":"#409EFF","primaryHover":"#3A8EE6","danger":"#F56C6C","gray":"#C0C4CC","accent":"#69C0FF","accentHover":"#53B0F0","textMain":"#303133","textMuted":"#606266","border":"#E0E0E0","navActiveBg":"#ECF5FF","groupGradientStart":"#66B1FF","groupGradientEnd":"#409EFF"}');