-- ========================================
-- 1. DISABLE FOREIGN KEY CHECKS
-- ========================================
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================
-- 2. TRUNCATE CHILD TABLES FIRST
-- ========================================
TRUNCATE TABLE report_attachments;
TRUNCATE TABLE report_messages;
TRUNCATE TABLE reports;

TRUNCATE TABLE chat_messages;
TRUNCATE TABLE chat_conversations;

TRUNCATE TABLE notifications;
TRUNCATE TABLE wishlists;

TRUNCATE TABLE refund_requests;
TRUNCATE TABLE room_availability_blocks;

TRUNCATE TABLE reviews;
TRUNCATE TABLE payments;
TRUNCATE TABLE reservations;

TRUNCATE TABLE room_images;
TRUNCATE TABLE rooms;

TRUNCATE TABLE property_images;
TRUNCATE TABLE properties;

-- ========================================
-- 3. RE-ENABLE FOREIGN KEY CHECKS
-- ========================================
SET FOREIGN_KEY_CHECKS = 1;
-- ========================================



CREATE TABLE countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);
CREATE TABLE provinces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,

    UNIQUE (country_id, name),

    FOREIGN KEY (country_id)
        REFERENCES countries(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    province_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,

    UNIQUE (province_id, name),

    FOREIGN KEY (province_id)
        REFERENCES provinces(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


ALTER TABLE properties
DROP COLUMN city,
DROP COLUMN province,
DROP COLUMN country;

ALTER TABLE properties
ADD COLUMN city_id INT NOT NULL AFTER address;

ALTER TABLE properties
ADD CONSTRAINT fk_properties_city
FOREIGN KEY (city_id) REFERENCES cities(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;