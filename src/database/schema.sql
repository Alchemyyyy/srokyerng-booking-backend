CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE account_statuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  status_name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  status_id INT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(30),
  password_hash TEXT NOT NULL,
  profile_image_url TEXT,
  gender VARCHAR(20),
  date_of_birth DATE,
  address TEXT,
  last_login TIMESTAMP NULL,
  email_verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_users_role
    FOREIGN KEY (role_id) REFERENCES roles(id),

  CONSTRAINT fk_users_status
    FOREIGN KEY (status_id) REFERENCES account_statuses(id)
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE property_statuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  status_name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE properties (
    id INT AUTO_INCREMENT PRIMARY KEY,

    owner_id INT NOT NULL,
    category_id INT NOT NULL,
    status_id INT NOT NULL,

    property_name VARCHAR(150) NOT NULL,
    description TEXT,

    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Cambodia',

    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),

    contact_phone VARCHAR(30),
    contact_email VARCHAR(150),

    rejection_reason TEXT,
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_properties_owner
        FOREIGN KEY (owner_id) REFERENCES users(id),

    CONSTRAINT fk_properties_category
        FOREIGN KEY (category_id) REFERENCES categories(id),

    CONSTRAINT fk_properties_status
        FOREIGN KEY (status_id) REFERENCES property_statuses(id),

    CONSTRAINT fk_properties_admin
        FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE TABLE property_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,

    image_url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_property_images_property
        FOREIGN KEY (property_id) REFERENCES properties(id)
        ON DELETE CASCADE
);

CREATE TABLE room_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,

    property_id INT NOT NULL,
    room_type_id INT NOT NULL,

    room_name VARCHAR(150) NOT NULL,
    description TEXT,

    price_per_night DECIMAL(10,2) NOT NULL,
    max_guests INT NOT NULL DEFAULT 1,
    total_rooms INT NOT NULL DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_rooms_property
        FOREIGN KEY (property_id) REFERENCES properties(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_rooms_type
        FOREIGN KEY (room_type_id) REFERENCES room_types(id)
);

CREATE TABLE room_images (
    id INT AUTO_INCREMENT PRIMARY KEY,

    room_id INT NOT NULL,

    image_url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_room_images_room
        FOREIGN KEY (room_id) REFERENCES rooms(id)
        ON DELETE CASCADE
);

CREATE TABLE amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,

    amenity_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE property_amenities (
    property_id INT NOT NULL,
    amenity_id INT NOT NULL,

    PRIMARY KEY (property_id, amenity_id),

    CONSTRAINT fk_property_amenities_property
        FOREIGN KEY (property_id) REFERENCES properties(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_property_amenities_amenity
        FOREIGN KEY (amenity_id) REFERENCES amenities(id)
        ON DELETE CASCADE
);

CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,

    customer_id INT NOT NULL,
    room_id INT NOT NULL,

    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,

    total_guests INT NOT NULL,
    total_nights INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,

    reservation_status VARCHAR(50) NOT NULL DEFAULT 'pending',

    special_request TEXT,
    cancellation_reason TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_reservations_customer
        FOREIGN KEY (customer_id) REFERENCES users(id),

    CONSTRAINT fk_reservations_room
        FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE TABLE payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,

    method_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE payment_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,

    status_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE owner_payment_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,

    owner_id INT NOT NULL,
    payment_method_id INT NOT NULL,

    account_name VARCHAR(150) NOT NULL,
    account_number VARCHAR(100),
    qr_image_url TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_owner_payment_accounts_owner
        FOREIGN KEY (owner_id) REFERENCES users(id),

    CONSTRAINT fk_owner_payment_accounts_method
        FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
);

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    reservation_id INT NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    owner_id INT NOT NULL,

    payment_method_id INT NOT NULL,
    payment_status_id INT NOT NULL,

    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',

    transaction_reference VARCHAR(255),
    receipt_image_url TEXT,

    verified_by INT NULL,
    verified_at TIMESTAMP NULL,
    paid_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_payments_reservation
        FOREIGN KEY (reservation_id) REFERENCES reservations(id),

    CONSTRAINT fk_payments_customer
        FOREIGN KEY (customer_id) REFERENCES users(id),

    CONSTRAINT fk_payments_owner
        FOREIGN KEY (owner_id) REFERENCES users(id),

    CONSTRAINT fk_payments_method
        FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),

    CONSTRAINT fk_payments_status
        FOREIGN KEY (payment_status_id) REFERENCES payment_statuses(id),

    CONSTRAINT fk_payments_verified_by
        FOREIGN KEY (verified_by) REFERENCES users(id)
);

CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,

    reservation_id INT NOT NULL UNIQUE,
    property_id INT NOT NULL,
    customer_id INT NOT NULL,

    rating INT NOT NULL,
    comment TEXT,

    owner_reply TEXT,
    replied_by INT NULL,
    replied_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_reviews_reservation
        FOREIGN KEY (reservation_id) REFERENCES reservations(id),

    CONSTRAINT fk_reviews_property
        FOREIGN KEY (property_id) REFERENCES properties(id),

    CONSTRAINT fk_reviews_customer
        FOREIGN KEY (customer_id) REFERENCES users(id),

    CONSTRAINT fk_reviews_owner_reply
        FOREIGN KEY (replied_by) REFERENCES users(id)
);