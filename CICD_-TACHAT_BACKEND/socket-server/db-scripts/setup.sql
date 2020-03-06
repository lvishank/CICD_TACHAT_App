create database if not exists chat;

use chat;

create table if not exists user(
    user_id int not null auto_increment,
    user_meta json,
    access_key varchar(50) not null,
    is_active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    primary key(user_id) 
);

create table if not exists room(
    room_id int not null auto_increment,
    name varchar(50) not null,
    is_active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    primary key(room_id)
);

create table if not exists user_room_mapping(
    user_room_id int not null auto_increment,
    user_id int not null references user(user_id),
    room_id int not null references room(room_id),
    is_active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    primary key(user_room_id)
);

create table if not exists user_session(
    user_session_id int not null auto_increment,
    user_id int not null references user(user_id),
    token varchar(500) not null,
    is_active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    primary key(user_session_id)
);

create table if not exists user_chat_message(
    user_chat_message_id int not null auto_increment,
    user_id int not null references user(user_id),
    room_id int not null references room(room_id),
    message text not null,
    is_active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    primary key(user_chat_message_id)
);