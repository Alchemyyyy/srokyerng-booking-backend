INSERT INTO payment_methods (method_name, description, is_active) VALUES
('ABA', 'Pay by ABA Bank transfer', TRUE),
('ACLEDA', 'Pay by ACLEDA Bank transfer', TRUE),
('Wing', 'Pay by Wing transfer', TRUE),
('KHQR', 'Pay by KHQR code', TRUE),
('Card', 'Pay by credit or debit card', TRUE),
('Cash', 'Pay by cash at property', TRUE)
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  is_active = VALUES(is_active);
