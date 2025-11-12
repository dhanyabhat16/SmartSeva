create database citizen_portal;
use citizen_portal;

create table citizen(
    citizen_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    aadhaar VARCHAR(20) UNIQUE NOT NULL,
    age INT CHECK (age >= 14),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    ration_card VARCHAR(20)
);

CREATE TABLE routes (
  route_id INT AUTO_INCREMENT PRIMARY KEY,
  route_name VARCHAR(100)
);
alter table routes modify route_name VARCHAR(100) UNIQUE NOT NULL;

CREATE TABLE RouteVariants (
    route_variant_id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    variant_name VARCHAR(100) UNIQUE NOT NULL,
    FOREIGN KEY (route_id) REFERENCES routes(route_id)
);
DELETE FROM RouteVariants;


create table bus(
    bus_id int AUTO_INCREMENT PRIMARY KEY,
    bus_name VARCHAR(50) NOT NULL,
    total_seats INT NOT NULL,
    route_id INT,
    FOREIGN KEY (route_id) REFERENCES routes(route_id)
);
ALTER TABLE bus
ADD COLUMN route_variant_id INT,
ADD FOREIGN KEY (route_variant_id) REFERENCES RouteVariants(route_variant_id);


create table bus_stops(
    stop_id INT AUTO_INCREMENT PRIMARY KEY,
    stop_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE RouteStops (
  route_stop_id INT AUTO_INCREMENT PRIMARY KEY,
  route_id INT,
  stop_id INT,
  stop_order INT,
  FOREIGN KEY (route_id) REFERENCES routes(route_id),
  FOREIGN KEY (stop_id) REFERENCES bus_stops(stop_id)
);
TRUNCATE TABLE RouteStops;
ALTER TABLE RouteStops 
ADD CONSTRAINT unique_route_order UNIQUE (route_id, stop_order);

ALTER TABLE RouteStops DROP FOREIGN KEY routestops_ibfk_1;
ALTER TABLE RouteStops DROP INDEX unique_route_order;
ALTER TABLE RouteStops
ADD CONSTRAINT routestops_ibfk_1 FOREIGN KEY (route_id) REFERENCES routes(route_id);


ALTER TABLE RouteStops
ADD COLUMN route_variant_id INT NOT NULL,
ADD FOREIGN KEY (route_variant_id) REFERENCES RouteVariants(route_variant_id);



CREATE TABLE BusSchedule (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    route_id INT NOT NULL,
    stop_id INT NOT NULL,
    arrival_time TIME,
    departure_time TIME,
    FOREIGN KEY (bus_id) REFERENCES bus(bus_id),
    FOREIGN KEY (route_id) REFERENCES routes(route_id),
    FOREIGN KEY (stop_id) REFERENCES bus_stops(stop_id)
);
ALTER TABLE BusSchedule
ADD COLUMN route_variant_id INT NOT NULL,
ADD FOREIGN KEY (route_variant_id) REFERENCES RouteVariants(route_variant_id);


CREATE TABLE Booking (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  citizen_id INT,
  bus_id INT,
  src_stop_id INT,
  dst_stop_id INT,
  seat_number INT CHECK (seat_number > 0),
  travel_date DATE,
  booking_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (citizen_id) REFERENCES citizen(citizen_id),
  FOREIGN KEY (bus_id) REFERENCES bus(bus_id),
  FOREIGN KEY (src_stop_id) REFERENCES bus_stops(stop_id),
  FOREIGN KEY (dst_stop_id) REFERENCES bus_stops(stop_id)
);
ALTER TABLE Booking
ADD COLUMN route_variant_id INT NOT NULL,
ADD FOREIGN KEY (route_variant_id) REFERENCES RouteVariants(route_variant_id);


CREATE TABLE Payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id)
);

CREATE TABLE Admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    full_name VARCHAR(100) NOT NULL
);

--roles
CREATE ROLE 'admin_role';
CREATE ROLE 'citizen_role';
--granting privileges to the admins
GRANT ALL PRIVILEGES ON citizen_portal.* TO 'admin_role';
--granting privileges to the citizens
GRANT SELECT, INSERT ON citizen_portal.citizen TO 'citizen_role';
GRANT SELECT ON citizen_portal.routes TO 'citizen_role';
GRANT SELECT ON citizen_portal.bus TO 'citizen_role';
GRANT SELECT ON citizen_portal.bus_stops TO 'citizen_role';
GRANT SELECT ON citizen_portal.BusSchedule TO 'citizen_role';
GRANT SELECT ON citizen_portal.RouteStops TO 'citizen_role';
GRANT SELECT, INSERT ON citizen_portal.Booking TO 'citizen_role';
GRANT SELECT, INSERT ON citizen_portal.Payment TO 'citizen_role';

drop role 'admin_role';
drop role 'citizen_role';

drop trigger prevent_past_booking;
-- trigger to prevent booking in the past
CREATE TRIGGER prevent_past_booking
BEFORE INSERT ON Booking
FOR EACH ROW
BEGIN
DECLARE dep_time TIME;
    IF NEW.travel_date <= CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot book for past dates.';
    END IF;
    IF NEW.travel_date = CURDATE() THEN
        SELECT departure_time INTO dep_time
        FROM BusSchedule
        WHERE bus_id = NEW.bus_id
          AND stop_id = NEW.src_stop_id
        LIMIT 1;

        IF dep_time IS NOT NULL AND CURTIME() >= dep_time THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot book after bus has departed.';
        END IF;
    END IF;
END ; 

drop function is_seat_available;
--function to check the availability of seats
CREATE FUNCTION is_seat_available(
    p_bus_id INT,
    p_seat_number INT,
    p_src_stop_id INT,
    p_dst_stop_id INT, 
    p_travel_date DATE
)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE seat_count INT;
    DECLARE new_src_order INT;
    DECLARE new_dst_order INT;
    DECLARE v_route_variant_id int;

    SELECT route_variant_id INTO v_route_variant_id
    FROM bus
    WHERE bus_id = p_bus_id;

    SELECT stop_order INTO new_src_order
    FROM RouteStops
    WHERE route_variant_id = v_route_variant_id
      AND stop_id = p_src_stop_id;

    SELECT stop_order INTO new_dst_order
    FROM RouteStops
    WHERE route_variant_id = v_route_variant_id
      AND stop_id = p_dst_stop_id;


    SELECT COUNT(*) INTO seat_count
    FROM booking b
    JOIN routestops rs_src 
        ON rs_src.stop_id = b.src_stop_id AND rs_src.route_variant_id = v_route_variant_id
    JOIN routestops rs_dst 
        ON rs_dst.stop_id = b.dst_stop_id AND rs_dst.route_variant_id = v_route_variant_id
    WHERE b.bus_id = p_bus_id
      AND b.travel_date = p_travel_date
      AND b.seat_number = p_seat_number
      AND NOT (
          new_dst_order <= rs_src.stop_order  -- new segment ends before existing one starts
          or new_src_order >= rs_dst.stop_order -- new segment starts after existing one ends
      );

    RETURN seat_count = 0;

END ;

drop procedure book_ticket;
--procedure to book a bus
CREATE PROCEDURE book_ticket(
    IN p_citizen_id INT,
    IN p_bus_id INT,
    IN p_route_variant_id INT,
    IN p_src_stop_id INT,
    IN p_dst_stop_id INT,
    IN p_seat_number INT,
    IN p_travel_date DATE,
    IN p_amount DECIMAL(10,2),
    IN p_payment_method VARCHAR(50)
)
BEGIN
    DECLARE available BOOLEAN;
    DECLARE total_seats INT;

    -- Check travel date validity
    IF p_travel_date <= CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot book for past dates.';
    END IF;

    -- Check seat number validity
    SELECT total_seats INTO total_seats FROM bus WHERE bus_id = p_bus_id;
    IF p_seat_number > total_seats THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid seat number.';
    END IF;

    -- Check seat availability
    SET available = is_seat_available(p_bus_id, p_seat_number, p_src_stop_id, p_dst_stop_id, p_travel_date);

    IF available THEN
        -- Insert booking
        INSERT INTO Booking (citizen_id,route_variant_id, bus_id, src_stop_id, dst_stop_id, seat_number, travel_date)    
        VALUES (p_citizen_id,p_route_variant_id, p_bus_id, p_src_stop_id, p_dst_stop_id, p_seat_number, p_travel_date);

        -- Create corresponding payment record
        INSERT INTO Payment (booking_id, amount, payment_method, status)
        VALUES (LAST_INSERT_ID(), p_amount, p_payment_method, 'completed');
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seat not available for selected segment.';
    END IF;

END ;

--function to calculate the amount to be paid
create function calculate_fare(
    p_route_variant_id int,
    p_src_stop_id int,
    p_dst_stop_id int
)
RETURNS decimal(10,2)
DETERMINISTIC
begin 
declare src_order int;
declare dst_order int;
declare no_stops int;
declare fare decimal(10,2);

select stop_order into src_order
from routestops
where route_variant_id=p_route_variant_id
and stop_id=p_src_stop_id
limit 1;

select stop_order into dst_order
from routestops
where route_variant_id=p_route_variant_id
and stop_id=p_dst_stop_id
limit 1;

if src_order>=dst_order THEN
    signal SQLSTATE '45000'
    set MESSAGE_TEXT='Invlaid source and destination order';
end if;

set no_stops=(dst_order-src_order+1);
set fare=no_stops*10;
return fare;

end;


--trigger to prevent duplicate usernames in citizen which is in admin
CREATE TRIGGER duplicate_citizen_username
BEFORE INSERT ON citizen
FOR EACH ROW
BEGIN
DECLARE existing_count INT;
SELECT COUNT(*) INTO existing_count FROM admin WHERE username = NEW.username;
if existing_count > 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Username already exists in admin table.';
END IF;
END ;

--trigger to prevent duplicate usernames in admin which is in citizen
CREATE TRIGGER duplicate_admin_username
BEFORE INSERT ON admin
FOR EACH ROW
BEGIN
DECLARE existing_count INT;
SELECT COUNT(*) INTO existing_count FROM citizen WHERE username = NEW.username;
if existing_count > 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Username already exists in citizen table.';
END IF;
END ;

--trigger to ensure positive total_seats number less that 65
CREATE TRIGGER valid_total_seats
BEFORE INSERT ON bus
FOR EACH ROW
BEGIN
    IF NEW.total_seats <= 0 OR NEW.total_seats >= 65 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid total_seats number. Total seats must be between 1 and 64.';
    END IF;
END ;


--procedure to check if the deletion of route is safe
CREATE PROCEDURE safe_delete_route(
    IN p_route_id INT
)
begin declare bus_count INT;
declare variant_count INT;
    SELECT COUNT(*) INTO bus_count FROM bus WHERE route_id = p_route_id;
    select count(*) into variant_count from RouteVariants where route_id = p_route_id;
    if bus_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot delete route with assigned buses.';
    elseIF variant_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot delete route with existing route variants.';
    ELSE
        DELETE FROM routes WHERE route_id = p_route_id;
    END IF;
END ;

--procedure to check if the deletion of bus is safe
CREATE PROCEDURE safe_delete_bus(
    IN p_bus_id INT
)
begin declare booking_count INT;
declare bus_scheduled_count INT;
    SELECT COUNT(*) INTO booking_count FROM Booking WHERE bus_id = p_bus_id;
    select count(*) into bus_scheduled_count from BusSchedule where bus_id = p_bus_id;
    if (booking_count > 0|| bus_scheduled_count > 0) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot delete bus with existing bookings.';
    ELSE
        DELETE FROM bus WHERE bus_id = p_bus_id;
    END IF;
END ;


--procedure to add new route variant
create procedure add_route_stop_variant(
    in route_id int,
    in p_route_variant_id INT,
    in p_stop_id int,
    in p_stop_order int
)
begin declare variant_exists int;
DECLARE stop_exists int;

    select count(*) into variant_exists from RouteVariants where route_variant_id = p_route_variant_id;
    select count(*) into stop_exists from bus_stops where stop_id = p_stop_id;

    if variant_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Route variant does not exist.';
    elseIF stop_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Bus stop does not exist.';
    ELSE
        INSERT INTO RouteStops (route_variant_id, route_id, stop_id, stop_order)
            VALUES (p_route_variant_id, route_id, p_stop_id, p_stop_order);
    END IF;
end;

--adding valid bus schedule procedure
create procedure add_valid_bus_schedule(
    in p_bus_id int,
    in p_route_id int,
    in p_route_variant_id int,
    in p_stop_id int,
    in p_arrival_time time,
    in p_departure_time time
)
begin
insert into BusSchedule
    (bus_id, route_id, route_variant_id, stop_id, arrival_time, departure_time)
    values
    (p_bus_id, p_route_id, p_route_variant_id, p_stop_id, p_arrival_time, p_departure_time);
end;

--trigger to ensure the insertion in bus schedule the arrival is before departure
CREATE TRIGGER valid_arrival_departure
BEFORE INSERT ON BusSchedule
FOR EACH ROW
BEGIN
    IF NEW.arrival_time >= NEW.departure_time THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid schedule: Arrival time must be before departure time.';
    END IF;
END;
SELECT get_stop_names_from_ids('1_3_2');

--function to convert '1_3_2' to "bellandur_whitefield_nayandhalli"
DROP FUNCTION IF EXISTS get_stop_names_from_ids;
CREATE FUNCTION get_stop_names_from_ids(p_stop_ids VARCHAR(255))
RETURNS VARCHAR(1000)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE stop_names VARCHAR(1000);
    DECLARE formatted_ids VARCHAR(255);

    SET formatted_ids = REPLACE(p_stop_ids, '_', ',');

    SELECT GROUP_CONCAT(stop_name ORDER BY FIND_IN_SET(stop_id, formatted_ids) SEPARATOR '_')
    INTO stop_names
    FROM bus_stops
    WHERE FIND_IN_SET(stop_id, formatted_ids);

    RETURN stop_names;
END;
