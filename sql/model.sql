create database foundation_homeworks;

drop table if exists users cascade;
create table if not exists users (
  user_id int not null unique primary key,
  chat_id int not null unique, 
  first_name varchar,
  last_name varchar,
  username varchar,
  user_type varchar not null default 'user',
  user_created_at timestamp default CURRENT_TIMESTAMP,
  user_updated_at timestamp default CURRENT_TIMESTAMP,
  user_deleted_at timestamp default null
);

drop table if exists files cascade;
create table if not exists files (
  user_id int not null references users(user_id),
  file_id varchar not null unique primary key,
  file_orginal_name varchar not null,
  file_name varchar not null,
  file_path varchar not null,
  mimetype varchar not null,
  file_send_time int not null,
  file_size int not null,
  file_caption varchar,
  score smallint default -1,
  is_confirmed boolean default false,
  is_checked boolean default false,
  file_created_at timestamp default CURRENT_TIMESTAMP,
  file_updated_at timestamp default CURRENT_TIMESTAMP,
  file_deleted_at timestamp default null
);

drop table if exists groups cascade;
create table if not exists groups(
  group_id bigint not null unique, 
  group_title varchar not null, 
  group_link varchar,
  chat_type varchar,
  group_created_at timestamp default CURRENT_TIMESTAMP,
  group_updated_at timestamp default CURRENT_TIMESTAMP,
  group_deleted_at timestamp default null
);

drop table if exists messages cascade;
create table if not exists messages(
  message_id bigint not null unique,
  user_id bigint not null references users(user_id),
  first_name varchar,
  last_name varchar,
  username varchar,
  message_type varchar default 'question', 
  message_text varchar not null,
  is_answer_returned boolean not null default false,
  user_responded_id bigint,
  message_created_at timestamp default CURRENT_TIMESTAMP,
  message_updated_at timestamp default CURRENT_TIMESTAMP,
  message_deleted_at timestamp default null
);


insert into groups (group_id, group_title, chat_type) 
  values (-123917638712, 'salom dunyo', 'supergroup');