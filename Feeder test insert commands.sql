INSERT INTO Unit(val) VALUES ('g');
INSERT INTO User(email, pass, salt) VALUES ('test@test.test', 'test', 'test');
INSERT INTO Device(mac, FK_user_id) VALUES ('test', (SELECT id FROM User WHERE email = 'test@test.test'));
INSERT INTO Log(val, datetime, FK_device_id, FK_unit_id) VALUES (1234.56, '2000-12-12 12:12:12', (SELECT id FROM Device WHERE mac = 'test'), (SELECT id FROM Unit WHERE val = 'g')); 
INSERT INTO Log(val, datetime, FK_device_id, FK_unit_id) VALUES (1000.56, '2000-12-12 12:12:24', (SELECT id FROM Device WHERE mac = 'test'), (SELECT id FROM Unit WHERE val = 'g')); 
INSERT INTO Log(val, datetime, FK_device_id, FK_unit_id) VALUES (2000.56, '2000-12-12 12:12:36', (SELECT id FROM Device WHERE mac = 'test'), (SELECT id FROM Unit WHERE val = 'g')); 
INSERT INTO Device(mac, FK_user_id) VALUES ('test2', (SELECT id FROM User WHERE email = 'test@test.test'));
INSERT INTO Log(val, datetime, FK_device_id, FK_unit_id) VALUES (1500.56, '2000-12-12 12:13:36', (SELECT id FROM Device WHERE mac = 'test2'), (SELECT id FROM Unit WHERE val = 'g')); 
INSERT INTO Log(val, datetime, FK_device_id, FK_unit_id) VALUES (1600.56, '2000-12-12 12:13:46', (SELECT id FROM Device WHERE mac = 'test2'), (SELECT id FROM Unit WHERE val = 'g')); 
