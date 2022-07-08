create database foundation_homeworks;
SET client_encoding = 'UTF8';

drop table if exists users cascade;
create table if not exists users (
  user_id bigint not null unique primary key,
  chat_id bigint not null unique, 
  first_name varchar,
  last_name varchar,
  username varchar,
  user_type varchar not null default 'user',
  user_created_at timestamp default localtimestamp,
  user_updated_at timestamp default localtimestamp,
  user_deleted_at timestamp default null
);

drop table if exists requests cascade;
create table if not exists requests (
  user_id bigint not null unique references users(user_id),
  selection varchar,
  list_page int not null default 1,
  list_limit int not null default 5,
  request_created_at timestamp default localtimestamp,
  request_updated_at timestamp default localtimestamp,
  request_deleted_at timestamp default null
);

drop table if exists files cascade;
create table if not exists files (
  user_id bigint not null references users(user_id),
  file_id varchar not null unique primary key,
  file_orginal_name varchar not null,
  file_name varchar not null,
  file_path varchar not null,
  mimetype varchar not null,
  file_size bigint not null,
  file_caption varchar,
  score smallint default -1,
  is_confirmed boolean default false,
  is_checked boolean default false,
  file_created_at timestamp default localtimestamp,
  file_updated_at timestamp default localtimestamp,
  file_deleted_at timestamp default null
);

drop table if exists groups cascade;
create table if not exists groups(
  group_id bigint not null unique, 
  group_title varchar not null, 
  group_link varchar,
  chat_type varchar,
  group_created_at timestamp default localtimestamp,
  group_updated_at timestamp default localtimestamp,
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
  message_created_at timestamp default localtimestamp,
  message_updated_at timestamp default localtimestamp,
  message_deleted_at timestamp default null
);








-- 1881954930