-- Script para limpiar la base de datos y dejar que TypeORM la recree
-- ADVERTENCIA: Esto eliminará TODOS los datos

BEGIN;

-- Eliminar todas las tablas
DROP TABLE IF EXISTS public.form_answer CASCADE;
DROP TABLE IF EXISTS public.form_response CASCADE;
DROP TABLE IF EXISTS public.form_assignment CASCADE;
DROP TABLE IF EXISTS public.question_option CASCADE;
DROP TABLE IF EXISTS public.form_question CASCADE;
DROP TABLE IF EXISTS public.question_type CASCADE;
DROP TABLE IF EXISTS public.form CASCADE;
DROP TABLE IF EXISTS public.user_video_progress CASCADE;
DROP TABLE IF EXISTS public.user_course_enrollment CASCADE;
DROP TABLE IF EXISTS public.user_path_enrollment CASCADE;
DROP TABLE IF EXISTS public.course_path_detail CASCADE;
DROP TABLE IF EXISTS public.certificate CASCADE;
DROP TABLE IF EXISTS public.video CASCADE;
DROP TABLE IF EXISTS public.document_permission CASCADE;
DROP TABLE IF EXISTS public.document CASCADE;
DROP TABLE IF EXISTS public.folder CASCADE;
DROP TABLE IF EXISTS public.user_project CASCADE;
DROP TABLE IF EXISTS public.project CASCADE;
DROP TABLE IF EXISTS public.vacation_request CASCADE;
DROP TABLE IF EXISTS public.vacation CASCADE;
DROP TABLE IF EXISTS public.course_path CASCADE;
DROP TABLE IF EXISTS public.course CASCADE;
DROP TABLE IF EXISTS public.user_functional_assignment CASCADE;
DROP TABLE IF EXISTS public.user_position CASCADE;
DROP TABLE IF EXISTS public.team CASCADE;
DROP TABLE IF EXISTS public.methodology CASCADE;
DROP TABLE IF EXISTS public.coordination CASCADE;
DROP TABLE IF EXISTS public."position" CASCADE;
DROP TABLE IF EXISTS public.area CASCADE;
DROP TABLE IF EXISTS public.news_audience CASCADE;
DROP TABLE IF EXISTS public.news CASCADE;
DROP TABLE IF EXISTS public.benefit CASCADE;
DROP TABLE IF EXISTS public.benefit_type CASCADE;
DROP TABLE IF EXISTS public.user_account_detail CASCADE;
DROP TABLE IF EXISTS public.user_account CASCADE;
DROP TABLE IF EXISTS public.role CASCADE;
DROP TABLE IF EXISTS public.country CASCADE;

COMMIT;

-- TypeORM recreará todas las tablas automáticamente cuando reinicies el servidor
