CREATE DATABASE IF NOT EXISTS citizens;
USE citizens;
DROP TRIGGER IF EXISTS update_completion_date;
DROP TRIGGER IF EXISTS calculate_age_on_insert;
DROP TRIGGER IF EXISTS calculate_age_on_update;
DROP TRIGGER IF EXISTS log_application_status_change;

DROP FUNCTION IF EXISTS GetTotalApplications;
DROP FUNCTION IF EXISTS GetAvgProcessingTime;
DROP FUNCTION IF EXISTS IsAdmin;

DROP PROCEDURE IF EXISTS GetApplicationDetails;
DROP PROCEDURE IF EXISTS UpdateApplicationStatus;
DROP PROCEDURE IF EXISTS GetApplicationsByDepartment;
DROP PROCEDURE IF EXISTS GetDashboardStats;
DROP PROCEDURE IF EXISTS GetCitizenApplications;
DROP PROCEDURE IF EXISTS GetPendingDocuments;

-- Drop tables if they exist (in reverse order due to foreign keys)
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS Document;
DROP TABLE IF EXISTS Application;
DROP TABLE IF EXISTS Grievance;
DROP TABLE IF EXISTS Service;
DROP TABLE IF EXISTS Admin;
DROP TABLE IF EXISTS Department;
DROP TABLE IF EXISTS Citizen;

-- Create Tables
CREATE TABLE Citizen (
    citizen_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dob DATE,
    gender VARCHAR(10),
    age INT,
    phone VARCHAR(15),
    email VARCHAR(100) NOT NULL UNIQUE,
    aadhaar VARCHAR(20) UNIQUE,
    address TEXT,
    pin VARCHAR(10),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Department (
    dept_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(100),
    contact_phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Service (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    description TEXT,
    dept_id INT NOT NULL,
    fee DECIMAL(10,2) DEFAULT 0.00,
    processing_days INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES Department(dept_id) ON DELETE CASCADE
);

CREATE TABLE Application (
    app_id INT AUTO_INCREMENT PRIMARY KEY,
    citizen_id INT NOT NULL,
    service_id INT NOT NULL,
    applied_date DATE NOT NULL,
    completion_date DATE,
    status ENUM('PENDING', 'DOCUMENTS_VERIFIED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'DOCUMENT_REJECTED') DEFAULT 'PENDING',
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES Citizen(citizen_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES Service(service_id) ON DELETE CASCADE
);

CREATE TABLE Document (
    doc_id INT AUTO_INCREMENT PRIMARY KEY,
    app_id INT NOT NULL,
    doc_type VARCHAR(50),
    doc_path VARCHAR(255),
    uploaded_date DATE,
    verification_status ENUM('PENDING','VERIFIED','REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (app_id) REFERENCES Application(app_id) ON DELETE CASCADE
);

CREATE TABLE Payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    app_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE,
    payment_mode VARCHAR(50),
    transaction_id VARCHAR(50),
    status ENUM('PENDING','SUCCESS','FAILED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (app_id) REFERENCES Application(app_id) ON DELETE CASCADE
);

CREATE TABLE Grievance (
    grievance_id INT AUTO_INCREMENT PRIMARY KEY,
    citizen_id INT NOT NULL,
    service_id INT,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_date DATE NOT NULL,
    resolved_date DATE,
    resolution_remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES Citizen(citizen_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES Service(service_id) ON DELETE CASCADE
);

CREATE TABLE Admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    citizen_id INT NOT NULL UNIQUE,
    dept_id INT,
    role ENUM('SUPER_ADMIN','DEPT_ADMIN') DEFAULT 'DEPT_ADMIN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES Citizen(citizen_id) ON DELETE CASCADE,
    FOREIGN KEY (dept_id) REFERENCES Department(dept_id) ON DELETE SET NULL
);

-- Insert Sample Data
INSERT INTO Citizen (name, dob, gender, age, phone, email, aadhaar, address, pin, password) VALUES
('Amit Kumar', '1990-05-14', 'Male', 35, '9876543210', 'amit.kumar@gmail.com', '123456789012', '12 MG Road, Bengaluru', '560001', '$2a$10$example_hash_here'),
('Priya Sharma', '1995-07-22', 'Female', 30, '9123456789', 'priya.sharma@gmail.com', '234567890123', '45 Indiranagar, Bengaluru', '560038', '$2a$10$example_hash_here'),
('Ravi Patel', '1988-03-10', 'Male', 37, '9988776655', 'ravi.patel@gmail.com', '345678901234', '56 Koramangala, Bengaluru', '560095', '$2a$10$example_hash_here'),
('Sneha Reddy', '1992-12-01', 'Female', 33, '9090909090', 'sneha.reddy@gmail.com', '456789012345', '89 Whitefield, Bengaluru', '560066', '$2a$10$example_hash_here'),
('Arun Nair', '1985-01-05', 'Male', 40, '9800000000', 'arun.nair@gmail.com', '567890123456', '77 JP Nagar, Bengaluru', '560078', '$2a$10$example_hash_here');

INSERT INTO Department (dept_name, contact_email, contact_phone) VALUES
('Electricity Department', 'electricitydept@gmail.com', '080-4567890'),
('Gas Supply Department', 'gassupplydept@gmail.com', '080-5678901'),
('In-City Bus Booking Department', 'busbookingdept@gmail.com', '080-6789012'),
('Water Supply Department', 'watersupplydept@gmail.com', '080-7890123');

INSERT INTO Service (service_name, description, dept_id, fee, processing_days) VALUES
('Electricity Bill Payment', 'Pay your monthly electricity bills online', 1, 1200.00, 2),
('New Gas Connection', 'Apply for a new residential gas connection', 2, 2500.00, 7),
('Bus Pass Renewal', 'Renew your monthly in-city bus pass online', 3, 500.00, 3),
('New Water Connection', 'Apply for a new residential water connection', 4, 2000.00, 10),
('Gas Refill Booking', 'Book a gas cylinder refill online', 2, 950.00, 2);

INSERT INTO Application (citizen_id, service_id, applied_date, completion_date, status, remark) VALUES
(1, 1, '2025-10-01', '2025-10-02', 'COMPLETED', 'Electricity bill paid successfully'),
(2, 2, '2025-10-05', NULL, 'IN_PROGRESS', 'Connection under verification'),
(3, 3, '2025-10-07', '2025-10-09', 'COMPLETED', 'Bus pass renewed'),
(4, 4, '2025-10-10', NULL, 'PENDING', 'Application under review'),
(5, 5, '2025-10-11', '2025-10-12', 'COMPLETED', 'Gas refill delivered');

INSERT INTO Document (app_id, doc_type, doc_path, uploaded_date, verification_status) VALUES
(1, 'Aadhaar Card', '/docs/amit_aadhaar.pdf', '2025-10-01', 'VERIFIED'),
(2, 'Address Proof', '/docs/priya_address.pdf', '2025-10-05', 'PENDING'),
(3, 'Old Bus Pass', '/docs/ravi_buspass.pdf', '2025-10-07', 'VERIFIED'),
(4, 'Property Proof', '/docs/sneha_property.pdf', '2025-10-10', 'PENDING'),
(5, 'Gas Booking Receipt', '/docs/arun_receipt.pdf', '2025-10-11', 'VERIFIED');

INSERT INTO Payment (app_id, amount, payment_date, payment_mode, transaction_id, status) VALUES
(1, 1200.00, '2025-10-01', 'UPI', 'TXN1001', 'SUCCESS'),
(2, 2500.00, NULL, 'Credit Card', 'TXN1002', 'PENDING'),
(3, 500.00, '2025-10-07', 'UPI', 'TXN1003', 'SUCCESS'),
(4, 2000.00, NULL, 'NetBanking', 'TXN1004', 'PENDING'),
(5, 950.00, '2025-10-11', 'UPI', 'TXN1005', 'SUCCESS');

INSERT INTO Grievance (citizen_id, service_id, description, status, created_date, resolved_date, resolution_remark) VALUES
(1, 1, 'Bill payment confirmation delayed', 'RESOLVED', '2025-10-02', '2025-10-03', 'System updated'),
(2, 2, 'Gas connection taking too long', 'OPEN', '2025-10-06', NULL, NULL),
(3, 3, 'Bus pass not showing updated route', 'RESOLVED', '2025-10-09', '2025-10-10', 'Updated successfully'),
(4, 4, 'Water connection form stuck at review', 'IN_PROGRESS', '2025-10-12', NULL, NULL),
(5, 5, 'Gas refill not delivered on time', 'OPEN', '2025-10-13', NULL, NULL);

INSERT INTO Admin (citizen_id, dept_id, role) VALUES
(1, 1, 'SUPER_ADMIN'),
(2, 2, 'DEPT_ADMIN'),
(3, 3, 'DEPT_ADMIN'),
(4, 4, 'DEPT_ADMIN'),
(5, 2, 'DEPT_ADMIN');

-- ============================================
-- TRIGGERS
-- ============================================
DELIMITER //
CREATE TRIGGER validate_dob_before_insert
BEFORE INSERT ON Citizen
FOR EACH ROW
BEGIN
    IF NEW.dob > '2020-01-01' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Date of Birth after 2020 is not allowed';
    END IF;
END //
DELIMITER ;

-- Trigger to update completion_date when status changes to COMPLETED
DELIMITER //
CREATE TRIGGER update_completion_date 
BEFORE UPDATE ON Application
FOR EACH ROW
BEGIN
    IF NEW.status = 'COMPLETED' AND (OLD.status != 'COMPLETED' OR OLD.status IS NULL) THEN
        SET NEW.completion_date = CURDATE();
    END IF;
END //
DELIMITER ;

-- Trigger to update age when dob is inserted/updated
DELIMITER //
CREATE TRIGGER calculate_age_on_insert
BEFORE INSERT ON Citizen
FOR EACH ROW
BEGIN
    IF NEW.dob IS NOT NULL THEN
        SET NEW.age = TIMESTAMPDIFF(YEAR, NEW.dob, CURDATE());
    END IF;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER calculate_age_on_update
BEFORE UPDATE ON Citizen
FOR EACH ROW
BEGIN
    IF NEW.dob IS NOT NULL AND (NEW.dob != OLD.dob OR OLD.dob IS NULL) THEN
        SET NEW.age = TIMESTAMPDIFF(YEAR, NEW.dob, CURDATE());
    END IF;
END //
DELIMITER ;

-- Trigger to log application status changes 
DELIMITER //
CREATE TRIGGER log_application_status_change
AFTER UPDATE ON Application
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        SET @status_changed = 1;
    END IF;
END //
DELIMITER ;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to calculate total applications by citizen
DELIMITER //
CREATE FUNCTION GetTotalApplications(citizenId INT)
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total INT DEFAULT 0;
    SELECT COUNT(*) INTO total
    FROM Application
    WHERE citizen_id = citizenId;
    RETURN total;
END //
DELIMITER ;

-- Function to get average processing time for a service
DELIMITER //
CREATE FUNCTION GetAvgProcessingTime(serviceId INT)
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE avgDays DECIMAL(10,2) DEFAULT 0;
    SELECT AVG(DATEDIFF(completion_date, applied_date)) INTO avgDays
    FROM Application
    WHERE service_id = serviceId 
    AND status = 'COMPLETED' 
    AND completion_date IS NOT NULL;
    RETURN IFNULL(avgDays, 0);
END //
DELIMITER ;

-- Function to check if citizen is admin
DELIMITER //
CREATE FUNCTION IsAdmin(citizenId INT)
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE adminCount INT DEFAULT 0;
    SELECT COUNT(*) INTO adminCount
    FROM Admin
    WHERE citizen_id = citizenId;
    RETURN adminCount > 0;
END //
DELIMITER ;

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Procedure to get all applications with details
DELIMITER //
CREATE PROCEDURE GetApplicationDetails(IN appId INT)
BEGIN
    SELECT 
        a.app_id,
        a.citizen_id,
        c.name AS citizen_name,
        c.email AS citizen_email,
        a.service_id,
        s.service_name,
        d.dept_name,
        a.applied_date,
        a.completion_date,
        a.status,
        a.remark,
        DATEDIFF(COALESCE(a.completion_date, CURDATE()), a.applied_date) AS days_taken
    FROM Application a
    JOIN Citizen c ON a.citizen_id = c.citizen_id
    JOIN Service s ON a.service_id = s.service_id
    JOIN Department d ON s.dept_id = d.dept_id
    WHERE a.app_id = appId;
END //
DELIMITER ;

-- Procedure to update application status and send notification flag
DELIMITER //
CREATE PROCEDURE UpdateApplicationStatus(
    IN p_app_id INT,
    IN p_status VARCHAR(50),
    IN p_remark TEXT,
    OUT p_email_sent BOOLEAN
)
BEGIN
    DECLARE v_old_status VARCHAR(50);
    DECLARE v_citizen_email VARCHAR(100);
    DECLARE v_service_name VARCHAR(100);
    
    -- Get old status and citizen email
    SELECT status, c.email, s.service_name 
    INTO v_old_status, v_citizen_email, v_service_name
    FROM Application a
    JOIN Citizen c ON a.citizen_id = c.citizen_id
    JOIN Service s ON a.service_id = s.service_id
    WHERE a.app_id = p_app_id;
    
    -- Update application
    UPDATE Application 
    SET status = p_status,
        remark = p_remark,
        completion_date = IF(p_status = 'COMPLETED', CURDATE(), completion_date)
    WHERE app_id = p_app_id;
    
    -- Set email flag if status changed to COMPLETED
    IF p_status = 'COMPLETED' AND v_old_status != 'COMPLETED' THEN
        SET p_email_sent = TRUE;
        -- Email will be sent by backend application
    ELSE
        SET p_email_sent = FALSE;
    END IF;
END //
DELIMITER ;

-- Procedure to get applications by department
DELIMITER //
CREATE PROCEDURE GetApplicationsByDepartment(IN deptId INT)
BEGIN
    SELECT 
        a.app_id,
        a.citizen_id,
        c.name AS citizen_name,
        c.email AS citizen_email,
        s.service_name,
        a.applied_date,
        a.completion_date,
        a.status,
        a.remark
    FROM Application a
    JOIN Service s ON a.service_id = s.service_id
    JOIN Citizen c ON a.citizen_id = c.citizen_id
    WHERE s.dept_id = deptId
    ORDER BY a.applied_date DESC;
END //
DELIMITER ;

-- Procedure to get dashboard statistics
DELIMITER //
CREATE PROCEDURE GetDashboardStats(IN deptId INT)
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM Application a 
         JOIN Service s ON a.service_id = s.service_id 
         WHERE s.dept_id = deptId OR deptId IS NULL) AS total_applications,
        (SELECT COUNT(*) FROM Application a 
         JOIN Service s ON a.service_id = s.service_id 
         WHERE a.status = 'PENDING' AND (s.dept_id = deptId OR deptId IS NULL)) AS pending_applications,
        (SELECT COUNT(*) FROM Application a 
         JOIN Service s ON a.service_id = s.service_id 
         WHERE a.status = 'DOCUMENTS_VERIFIED' AND (s.dept_id = deptId OR deptId IS NULL)) AS documents_verified_applications,
        (SELECT COUNT(*) FROM Application a 
         JOIN Service s ON a.service_id = s.service_id 
         WHERE a.status = 'IN_PROGRESS' AND (s.dept_id = deptId OR deptId IS NULL)) AS in_progress_applications,
        (SELECT COUNT(*) FROM Application a 
         JOIN Service s ON a.service_id = s.service_id 
         WHERE a.status = 'COMPLETED' AND (s.dept_id = deptId OR deptId IS NULL)) AS completed_applications,
        (SELECT COUNT(*) FROM Grievance g 
         LEFT JOIN Service s ON g.service_id = s.service_id 
         WHERE g.status = 'OPEN' AND (s.dept_id = deptId OR deptId IS NULL)) AS open_grievances;
END //
DELIMITER ;

-- Procedure to get citizen applications with service details
DELIMITER //
CREATE PROCEDURE GetCitizenApplications(IN citizenId INT)
BEGIN
    SELECT 
        a.app_id,
        a.service_id,
        s.service_name,
        s.description AS service_description,
        d.dept_name,
        a.applied_date,
        a.completion_date,
        a.status,
        a.remark,
        s.fee,
        p.status AS payment_status,
        p.transaction_id
    FROM Application a
    JOIN Service s ON a.service_id = s.service_id
    JOIN Department d ON s.dept_id = d.dept_id
    LEFT JOIN Payment p ON a.app_id = p.app_id
    WHERE a.citizen_id = citizenId
    ORDER BY a.applied_date DESC;
END //
DELIMITER ;

-- Procedure to get pending documents for verification
DELIMITER //
CREATE PROCEDURE GetPendingDocuments(IN deptId INT)
BEGIN
    SELECT 
        d.doc_id,
        d.app_id,
        d.doc_type,
        d.doc_path,
        d.uploaded_date,
        d.verification_status,
        a.citizen_id,
        c.name AS citizen_name,
        s.service_name,
        s.dept_id
    FROM Document d
    JOIN Application a ON d.app_id = a.app_id
    JOIN Citizen c ON a.citizen_id = c.citizen_id
    JOIN Service s ON a.service_id = s.service_id
    WHERE d.verification_status = 'PENDING'
    AND (s.dept_id = deptId OR deptId IS NULL)
    ORDER BY d.uploaded_date ASC;
END //
DELIMITER ;

-- Show all tables
SELECT 'Database setup complete!' AS Message;

SELECT d.dept_id,d.dept_name,d.contact_email,d.contact_phone,COUNT(g.grievance_id) AS total_grievances
FROM Department d JOIN Service s ON d.dept_id = s.dept_id JOIN Grievance g ON s.service_id = g.service_id GROUP BY d.dept_id, d.dept_name, d.contact_email, d.contact_phone
ORDER BY total_grievances DESC LIMIT 1;
