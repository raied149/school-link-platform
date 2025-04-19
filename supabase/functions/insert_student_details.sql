
create or replace function public.insert_student_details(
  profile_id uuid,
  nationality text,
  language_pref text,
  date_of_birth text,
  gender_type text,
  guardian_info jsonb,
  medical_info jsonb
) returns void
language plpgsql
security definer
as $$
begin
  insert into student_details (
    id,
    nationality,
    language,
    dateOfBirth,
    gender,
    guardian,
    medical
  ) values (
    profile_id,
    nationality,
    language_pref,
    date_of_birth,
    gender_type,
    guardian_info,
    medical_info
  );
end;
$$;
