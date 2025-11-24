BEGIN TRANSACTION;
CREATE TABLE Customers (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    surname TEXT,
    club_school TEXT,
    contact_number TEXT,
    contact_email TEXT
);
INSERT INTO "Customers" VALUES(1,'Adrian','MacKenzie','St John''s College','063 468 2925','adrianmackzie@gmail.com');
INSERT INTO "Customers" VALUES(2,'Jess','Van Niekerk','Not Applicable (N/A)','063 468 2925','jessicavanniekerk978@gmail.com');
INSERT INTO "Customers" VALUES(3,'Chantal','MacKenzie','Not Applicable (N/A)','083 251 7031','chantalcmac@gmail.com');
INSERT INTO "Customers" VALUES(4,'John','Doe','KEPS','012 345 6789','johndoe@tuks.com');
INSERT INTO "Customers" VALUES(5,'Connor','MacKenzie','Hilton College','012 345 6789','conadmac@gmail.com');
INSERT INTO "Customers" VALUES(6,'Bruce','MacKenzie','King Edward VII','012 345 6789','info@snugfitmouthguards.co.za');
INSERT INTO "Customers" VALUES(7,'Jane','Doe','St Mary''s DSG','012 345 6789','janedoe@test.com');
INSERT INTO "Customers" VALUES(8,'Final','Test','SACS','012 345 8678','u23584620@tuks.co.za');
INSERT INTO "Customers" VALUES(9,'Adrian','MacKenzie','Not Applicable (N/A)','063 468 2925','u23584620@tuks.co.za');
INSERT INTO "Customers" VALUES(10,'Render','Test','Diggers','012 345 8678','u23584620@tuks.co.za');
INSERT INTO "Customers" VALUES(11,'Dual','Backend Test','Not Applicable (N/A)','063 468 2925','adrianmackzie@gmail.com');
INSERT INTO "Customers" VALUES(12,'Netlify','Dual Test','Diggers','063 468 2925','u23584620@tuks.co.za');
INSERT INTO "Customers" VALUES(13,'Netlify','Test 2','Not Applicable (N/A)','012 345 8678','u23584620@tuks.co.za');
INSERT INTO "Customers" VALUES(14,'Updated','Thank You Page','Not Applicable (N/A)','012 345 8678','u23584620@tuks.co.za');
INSERT INTO "Customers" VALUES(15,'Updated','Thank You v2','Valke','012 345 8678','u23584620@tuks.co.za');
INSERT INTO "Customers" VALUES(16,'Adrian','Thank You v3','St John''s College','012 345 8678','u23584620@tuks.co.za');
CREATE TABLE Orders (
    order_date TEXT,
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    impression_id TEXT UNIQUE,
    customer_id INTEGER,
    product_id INTEGER,
    payment_method TEXT,
    payment_status TEXT,
    total_price REAL,
    public_image_url TEXT,
    additional_notes TEXT,
    email_status TEXT,
    FOREIGN KEY(customer_id) REFERENCES Customers(customer_id),
    FOREIGN KEY(product_id) REFERENCES Products(product_id)
);
INSERT INTO "Orders" VALUES('2025/10/20',1,'A01',1,9,'Cash','Paid','R800.00','https://drive.google.com/uc?export=view&id=1TsRRKdKMOCVIqjopiVwD1lbxd9A0l2B-','White logo background.','SENT');
INSERT INTO "Orders" VALUES('2025/10/20',2,'A02',2,41,'EFT','Paid','R1,160.00','None','Fetch the mouthguard from reception at the practice.','SENT');
INSERT INTO "Orders" VALUES('2025/10/20',3,'A03',3,6,'EFT','Not Paid','R800.00','https://drive.google.com/uc?export=view&id=1p_OJUxTKs1_JGQv4q1I6VGcbBg44sGnt','None','SENT');
INSERT INTO "Orders" VALUES('2025/10/20',4,'A04',4,47,'EFT','Not Paid','R1,600.00','None','None','SENT');
INSERT INTO "Orders" VALUES('2025/10/20',5,'A05',5,4,'Card','Paid','R800.00','https://drive.google.com/uc?export=view&id=1wQowo2WbCcVn4t0_uZBK-gihleW3QM7w','Fetch from Snugfit reception.','SENT');
INSERT INTO "Orders" VALUES('2025/10/20',6,'A06',6,46,'Cash','Not Paid','R980.00','None','None.','SENT');
INSERT INTO "Orders" VALUES('2025/10/21',7,'A07',7,5,'Cash','Not Paid','R800.00','https://drive.google.com/uc?export=view&id=1MZCh6lrz3kUrkMIdjC8IjCtSRkie3wHG','Delivery by uber pickup.','SENT');
INSERT INTO "Orders" VALUES('2025/10/26',8,'A08',8,13,'Card','Not Paid','R800.00','https://drive.google.com/uc?export=view&id=1wuOXEcpSH8vqRnFNpJmTfL7vk7V40UDg','I want a white background please.','SENT');
INSERT INTO "Orders" VALUES('2025/05/02',17,'A09',9,9,'Cash','Paid','R800.00','https://drive.google.com/uc?export=view&id=1ttqu6rVKXpQVNvoaZK5nnLSkR4X-7tOT','Pre-exam test','SENT');
INSERT INTO "Orders" VALUES('2025/05/16',18,'A10',9,9,'Cash','Not Paid','R800.00','https://drive.google.com/uc?export=view&id=18-pUUYyuFBIdnGTAqjksDX4Gc_Wve4WZ','Netlify test','SENT');
INSERT INTO "Orders" VALUES('2025/05/22',19,'A11',3,6,'Cash','Paid','R800.00','https://drive.google.com/uc?export=view&id=1ptnHFOtxdgZEDbqrBXOaSpomjt0ZqX1l','Live netlify website test','SENT');
INSERT INTO "Orders" VALUES('2025/05/24',20,'A12',10,18,'Card','Not Paid','R850.00','None','Render Backend Test','SENT');
INSERT INTO "Orders" VALUES('2025/06/15',21,'A13',11,41,'EFT','Not Paid','R1,160.00','','Test','SENT');
INSERT INTO "Orders" VALUES('2025/07/09',22,'A14',12,37,'EFT','Paid','R980.00','','Netlify dual backend test','SENT');
INSERT INTO "Orders" VALUES('2025/08/06',23,'A15',13,20,'Cash','Not Paid','R850.00','','Netlify dual backend test 2','SENT');
INSERT INTO "Orders" VALUES('2025/09/14',24,'A16',14,9,'Cash','Paid','R800.00','https://drive.google.com/uc?export=view&id=19k2TW64Lo89iu6PkCUxe8A8eFUAjjv1l','Checking responsive thank you page','SENT');
INSERT INTO "Orders" VALUES('2025/11/23',25,'A17',15,6,'EFT','Paid','R800.00','https://drive.google.com/uc?export=view&id=1QuXwSvLnOG5BanM3ZUE_dVxuwfKITL61','Pre-exam test','SENT');
INSERT INTO "Orders" VALUES('2025/11/23',26,'A18',16,19,'Card','Not Paid','R850.00','','Thank You message test','SENT');
CREATE TABLE Products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_code TEXT,
    colour_selection TEXT,
    base_price REAL,
    colour_surcharge REAL,
    UNIQUE(product_code, colour_selection)
);
INSERT INTO "Products" VALUES(1,'MG Standard','Red',800.0,0.0);
INSERT INTO "Products" VALUES(2,'MG Standard','Blue',800.0,0.0);
INSERT INTO "Products" VALUES(3,'MG Standard','Green',800.0,0.0);
INSERT INTO "Products" VALUES(4,'MG Standard','Black',800.0,0.0);
INSERT INTO "Products" VALUES(5,'MG Standard','Purple',800.0,0.0);
INSERT INTO "Products" VALUES(6,'MG Standard','Pink',800.0,0.0);
INSERT INTO "Products" VALUES(7,'MG Standard','Orange',800.0,0.0);
INSERT INTO "Products" VALUES(8,'MG Standard','Yellow',800.0,0.0);
INSERT INTO "Products" VALUES(9,'MG Standard','White',800.0,0.0);
INSERT INTO "Products" VALUES(10,'MG Standard','Clear',800.0,0.0);
INSERT INTO "Products" VALUES(11,'MG Standard','Gold (+ R180)',800.0,180.0);
INSERT INTO "Products" VALUES(12,'MG Standard','Silver (+ R180)',800.0,180.0);
INSERT INTO "Products" VALUES(13,'MG Standard','Galaxy (+ R180)',800.0,180.0);
INSERT INTO "Products" VALUES(14,'MG Standard','Dual Colour (+ R180)',800.0,180.0);
INSERT INTO "Products" VALUES(15,'MG Standard','Tri Colour (+ R180)',800.0,180.0);
INSERT INTO "Products" VALUES(16,'Ortho (T)','Red',850.0,0.0);
INSERT INTO "Products" VALUES(17,'Ortho (T)','Blue',850.0,0.0);
INSERT INTO "Products" VALUES(18,'Ortho (T)','Green',850.0,0.0);
INSERT INTO "Products" VALUES(19,'Ortho (T)','Black',850.0,0.0);
INSERT INTO "Products" VALUES(20,'Ortho (T)','Purple',850.0,0.0);
INSERT INTO "Products" VALUES(21,'Ortho (T)','Pink',850.0,0.0);
INSERT INTO "Products" VALUES(22,'Ortho (T)','Orange',850.0,0.0);
INSERT INTO "Products" VALUES(23,'Ortho (T)','Yellow',850.0,0.0);
INSERT INTO "Products" VALUES(24,'Ortho (T)','White',850.0,0.0);
INSERT INTO "Products" VALUES(25,'Ortho (T)','Clear',850.0,0.0);
INSERT INTO "Products" VALUES(26,'Ortho (T)','Gold (+ R180)',850.0,180.0);
INSERT INTO "Products" VALUES(27,'Ortho (T)','Silver (+ R180)',850.0,180.0);
INSERT INTO "Products" VALUES(28,'Ortho (T)','Galaxy (+ R180)',850.0,180.0);
INSERT INTO "Products" VALUES(29,'Ortho (T)','Dual Colour (+ R180)',850.0,180.0);
INSERT INTO "Products" VALUES(30,'Ortho (T)','Tri Colour (+ R180)',850.0,180.0);
INSERT INTO "Products" VALUES(31,'Ortho (T&B)','Red',980.0,0.0);
INSERT INTO "Products" VALUES(32,'Ortho (T&B)','Blue',980.0,0.0);
INSERT INTO "Products" VALUES(33,'Ortho (T&B)','Green',980.0,0.0);
INSERT INTO "Products" VALUES(34,'Ortho (T&B)','Black',980.0,0.0);
INSERT INTO "Products" VALUES(35,'Ortho (T&B)','Purple',980.0,0.0);
INSERT INTO "Products" VALUES(36,'Ortho (T&B)','Pink',980.0,0.0);
INSERT INTO "Products" VALUES(37,'Ortho (T&B)','Orange',980.0,0.0);
INSERT INTO "Products" VALUES(38,'Ortho (T&B)','Yellow',980.0,0.0);
INSERT INTO "Products" VALUES(39,'Ortho (T&B)','White',980.0,0.0);
INSERT INTO "Products" VALUES(40,'Ortho (T&B)','Clear',980.0,0.0);
INSERT INTO "Products" VALUES(41,'Ortho (T&B)','Gold (+ R180)',980.0,180.0);
INSERT INTO "Products" VALUES(42,'Ortho (T&B)','Silver (+ R180)',980.0,180.0);
INSERT INTO "Products" VALUES(43,'Ortho (T&B)','Galaxy (+ R180)',980.0,180.0);
INSERT INTO "Products" VALUES(44,'Ortho (T&B)','Dual Colour (+ R180)',980.0,180.0);
INSERT INTO "Products" VALUES(45,'Ortho (T&B)','Tri Colour (+ R180)',980.0,180.0);
INSERT INTO "Products" VALUES(46,'Rubberised','Clear',980.0,0.0);
INSERT INTO "Products" VALUES(47,'Retainer','Clear',1600.0,0.0);
INSERT INTO "Products" VALUES(48,'Bleaching','Clear',1600.0,0.0);
DELETE FROM "sqlite_sequence";
INSERT INTO "sqlite_sequence" VALUES('Products',96);
INSERT INTO "sqlite_sequence" VALUES('Customers',16);
INSERT INTO "sqlite_sequence" VALUES('Orders',26);
COMMIT;
