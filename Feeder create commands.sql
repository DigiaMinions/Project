CREATE TABLE User(
id int(10) AUTO_INCREMENT,
email NVARCHAR(50) UNIQUE NOT NULL,
pass NVARCHAR(100) NOT NULL,
salt NVARCHAR(50) NOT NULL,
PRIMARY KEY (id)
);

CREATE TABLE Device(
id int(10) AUTO_INCREMENT,
mac NVARCHAR(50) UNIQUE NOT NULL,
name NVARCHAR(50) NOT NULL,
FK_user_id int(10) NOT NULL,
FOREIGN KEY (FK_user_id) REFERENCES User(id),
PRIMARY KEY (id)
);

CREATE TABLE Template(
id int(10) AUTO_INCREMENT,
name NVARCHAR(50) NOT NULL,
FK_user_id int(10) NOT NULL,
FOREIGN KEY (FK_user_id) REFERENCES User(id),
UNIQUE (FK_user_id, name),
PRIMARY KEY (id)
);

CREATE TABLE Schedule(
id int(10) AUTO_INCREMENT,
feedingtime time NOT NULL,
days int(10) NOT NULL,
FK_template_id int(10),
FOREIGN KEY (FK_template_id) REFERENCES Template(id),
PRIMARY KEY (id)
);