DROP DATABASE IF EXISTS `cowhealth-db`;
CREATE DATABASE IF NOT EXISTS `cowhealth-db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `cowhealth-db`;

-- RBAC

CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  description VARCHAR(191),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX permissions_name_key (name)
);

CREATE TABLE IF NOT EXISTS permission_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  description VARCHAR(191),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX permission_groups_name_key (name)
);

CREATE TABLE IF NOT EXISTS permission_group_permissions (
  group_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (group_id, permission_id),
  CONSTRAINT permission_group_permissions_group_id_fkey FOREIGN KEY (group_id) REFERENCES permission_groups (id) ON DELETE CASCADE,
  CONSTRAINT permission_group_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  description VARCHAR(191),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL,
  UNIQUE INDEX roles_name_key (name)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
  CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  password_hash VARCHAR(191) NOT NULL,
  profile ENUM('ADMIN', 'MANAGER', 'VIEWER') NOT NULL DEFAULT 'VIEWER',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL,
  UNIQUE INDEX users_email_key (email)
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
);

-- Core domain

CREATE TABLE IF NOT EXISTS farms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  cnpj VARCHAR(191) NOT NULL,
  address VARCHAR(191),
  city VARCHAR(191),
  state VARCHAR(191),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL,
  UNIQUE INDEX farms_cnpj_key (cnpj)
);

CREATE TABLE IF NOT EXISTS collars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  status ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL,
  UNIQUE INDEX collars_name_key (name)
);

CREATE TABLE IF NOT EXISTS cows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tag VARCHAR(191) NOT NULL,
  name VARCHAR(191),
  breed VARCHAR(191),
  birth_date DATETIME(3),
  status ENUM('HEALTHY', 'CALVING', 'HEAT_STRESS', 'ALERT') NOT NULL DEFAULT 'HEALTHY',
  farm_id INT NOT NULL,
  collar_id INT,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL,
  UNIQUE INDEX cows_tag_key (tag),
  UNIQUE INDEX cows_collar_id_key (collar_id),
  CONSTRAINT cows_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES farms (id) ON DELETE RESTRICT,
  CONSTRAINT cows_collar_id_fkey FOREIGN KEY (collar_id) REFERENCES collars (id) ON DELETE SET NULL
);

-- Sensor data

CREATE TABLE IF NOT EXISTS heart_rate_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cow_id INT NOT NULL,
  bpm INT NOT NULL,
  measured_at DATETIME(3) NOT NULL,
  received_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX heart_rate_data_cow_id_measured_at_idx (cow_id, measured_at),
  CONSTRAINT heart_rate_data_cow_id_fkey FOREIGN KEY (cow_id) REFERENCES cows (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS temperature_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cow_id INT NOT NULL,
  celsius DOUBLE NOT NULL,
  measured_at DATETIME(3) NOT NULL,
  received_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX temperature_data_cow_id_measured_at_idx (cow_id, measured_at),
  CONSTRAINT temperature_data_cow_id_fkey FOREIGN KEY (cow_id) REFERENCES cows (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS accelerometer_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cow_id INT NOT NULL,
  x DOUBLE NOT NULL,
  y DOUBLE NOT NULL,
  z DOUBLE NOT NULL,
  measured_at DATETIME(3) NOT NULL,
  received_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX accelerometer_data_cow_id_measured_at_idx (cow_id, measured_at),
  CONSTRAINT accelerometer_data_cow_id_fkey FOREIGN KEY (cow_id) REFERENCES cows (id) ON DELETE CASCADE
);

-- Notifications

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  cow_id INT,
  title VARCHAR(191) NOT NULL,
  message TEXT NOT NULL,
  read_at DATETIME(3),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX notifications_user_id_read_at_idx (user_id, read_at),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT notifications_cow_id_fkey FOREIGN KEY (cow_id) REFERENCES cows (id) ON DELETE SET NULL
);