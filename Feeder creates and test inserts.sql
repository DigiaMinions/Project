CREATE TABLE Device(
id int(10),
mac NVARCHAR(50) NOT NULL,
PRIMARY KEY (id)
);

CREATE TABLE User(
id int(10),
email NVARCHAR(50) NOT NULL,
pass NVARCHAR(100) NOT NULL,
salt NVARCHAR(50) NOT NULL,
FK_device_id int(10) NOT NULL,
PRIMARY KEY (id),
FOREIGN KEY (FK_device_id) REFERENCES Device(id)
);

CREATE TABLE Unit(
id int(10),
val NVARCHAR(10),
PRIMARY KEY (id)
);

CREATE TABLE Log(
id int(10),
val decimal(10,2) NOT NULL,
datetime datetime NOT NULL,
FK_device_id int(10) NOT NULL,
FK_unit_id int(10) NOT NULL,
PRIMARY KEY (id),
FOREIGN KEY (FK_device_id) REFERENCES Device(id),
FOREIGN KEY (FK_unit_id) REFERENCES Unit(id)
);

INSERT INTO Unit(val) VALUES ('g');
INSERT INTO Device(mac) VALUES ('test');
INSERT INTO User(email, pass, salt, FK_device_id) VALUES ('test@test.test', 'test', 'test', (SELECT id FROM Device WHERE mac = 'test'));
INSERT INTO Log(val, datetime, FK_device_id, FK_unit_id) VALUES (1234.56, '2000-12-12 12:12:12', (SELECT id FROM Device WHERE mac = 'test'), (SELECT id FROM Unit WHERE val = 'g')); 
