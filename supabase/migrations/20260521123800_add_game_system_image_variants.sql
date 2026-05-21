alter table public.game_systems
rename column image_url to cover_image_url;

alter table public.game_systems
add column background_image_url text not null default '',
add column logo_image_url text not null default '';
