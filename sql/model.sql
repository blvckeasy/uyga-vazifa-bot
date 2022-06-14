create database foundation_homeworks;

drop table if exists users cascade;
create table if not exists users (
  user_id int not null unique primary key,
  chat_id int not null unique, 
  first_name varchar,
  last_name varchar,
  username varchar,
  table_created_at timestamp default CURRENT_TIMESTAMP,
  table_updated_at timestamp default CURRENT_TIMESTAMP,
  table_deleted_at timestamp default null
);

drop table if exists files cascade;
create table if not exists files (
  file_id varchar not null unique primary key,
  user_id int not null references users(user_id),
  file_name varchar not null,
  file_path varchar not null,
  mime_type varchar not null,
  file_send_time timestamp not null,
  file_size int not null,
  file_caption varchar,
  score smallint default -1,
  is_checked boolean default false,
  table_created_at timestamp default CURRENT_TIMESTAMP,
  table_updated_at timestamp default CURRENT_TIMESTAMP,
  table_deleted_at timestamp default null
);

drop table if exists groups cascade;
create table if not exists groups(
  group_id bigint not null unique, 
  group_title varchar not null, 
  group_link varchar,
  chat_type varchar,
  table_created_at timestamp default CURRENT_TIMESTAMP,
  table_updated_at timestamp default CURRENT_TIMESTAMP,
  table_deleted_at timestamp default null
);

insert into groups (group_id, group_title, chat_type) 
  values (-123917638712, 'salom dunyo', 'supergroup');