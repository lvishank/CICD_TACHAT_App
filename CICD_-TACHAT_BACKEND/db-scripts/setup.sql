create database if not exists ci_cd_chat;

use ci_cd_chat;

create table if not exists department(
    department_id int not null auto_increment,
    name varchar(50) not null,
    display_name varchar(100) not null,
    is_active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    primary key(department_id)  
);

create table if not exists department_course_mapping(
    department_course_mapping_id int not null auto_increment,
    name varchar(50) not null,
    display_name varchar(100) not null,
    department_id int not null references department(department_id),
    is_active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    primary key(department_court_mapping_id)  
);

create table if not exists account(
    account_id int not null auto_increment,
    first_name varchar(50) not null,
    last_name varchar(50) default null,
    access_key varchar(50) not null,
    user_name varchar(50) not null,
    role enum('student', 'tutor') not null,
    is_active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    primary key(user_id) 
);

create table if not exists account_department_course_mapping(
    account_department_course_mapping_id int not null auto_increment,
    account_id int not null references account(account_id),
    department_course_mapping_id int not null references(department_course_mapping_id),
    is_active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    primary key(account_department_course_mapping_id)
);