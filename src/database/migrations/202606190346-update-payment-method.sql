-- Update payment methods and remove old ones
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM payments WHERE payment_method_id BETWEEN 4 AND 6;
DELETE FROM payment_methods WHERE id BETWEEN 4 AND 6;
SET FOREIGN_KEY_CHECKS = 1;

-- Add new payment methods
INSERT INTO payment_methods (method_name, description, is_active) VALUES
('Vattanac', 'Pay by Vattanac Bank transfer', TRUE),
('Chip Mong', 'Pay by Chip Mong Bank transfer', TRUE),
('Sathapana', 'Pay by Sathapana Bank transfer', TRUE),
('PPC', 'Pay by PPC Bank transfer', TRUE),
('Woori', 'Pay by Woori Bank transfer', TRUE),
('Canadia', 'Pay by Canadia Bank transfer', TRUE)
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  is_active = VALUES(is_active);