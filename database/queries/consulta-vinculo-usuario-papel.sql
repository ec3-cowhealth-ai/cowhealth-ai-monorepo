USE `cowhealth-db`;

-- Ver vínculos usuário-role
SELECT u.name, r.name FROM user_roles ur
JOIN users u ON u.id = ur.user_id
JOIN roles r ON r.id = ur.role_id;