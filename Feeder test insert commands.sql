
INSERT INTO User(email, pass, salt) VALUES ('test@test.test', 'test', 'test');
INSERT INTO Device(mac, name, FK_user_id) VALUES ('test', 'test', (SELECT id FROM User WHERE email = 'test@test.test'));
INSERT INTO Template(name, FK_user_id) VALUES ('testtemplate', (SELECT ID FROM User WHERE email = 'test@test.test'));
INSERT INTO Schedule(feedingtime, days, FK_template_id) VALUES ('08:00:00', 3, (SELECT id FROM Template WHERE name = 'testtemplate'));
