DELETE FROM public.staff_passes WHERE email IN ('test.creator+qa@example.com', 'test+notify@madmonkeyhostels.com');
DELETE FROM public.approved_creator_emails WHERE email IN ('test.creator+qa@example.com', 'test+notify@madmonkeyhostels.com');
DELETE FROM public.activity_log WHERE details ILIKE '%test.creator+qa@example.com%' OR details ILIKE '%test+notify@madmonkeyhostels.com%';