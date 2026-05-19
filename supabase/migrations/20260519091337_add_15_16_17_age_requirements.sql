alter type public.event_table_age_requirement add value if not exists 'age_15_plus' after 'age_14_plus';
alter type public.event_table_age_requirement add value if not exists 'age_16_plus' after 'age_15_plus';
alter type public.event_table_age_requirement add value if not exists 'age_17_plus' after 'age_16_plus';
