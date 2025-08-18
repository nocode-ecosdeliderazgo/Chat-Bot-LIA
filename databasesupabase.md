-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.ai_courses (
  id_ai_courses uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name character varying NOT NULL,
  purchase_url character varying NOT NULL,
  long_description character varying NOT NULL,
  short_description character varying NOT NULL,
  price character varying NOT NULL,
  currency character varying NOT NULL,
  session_count smallint,
  total_duration bigint,
  course_url character varying,
  status character varying,
  roi character varying,
  modality character varying,
  series_id uuid,
  temario_url text,
  bonuses jsonb,
  info_docs jsonb,
  ai_feedback text,
  CONSTRAINT ai_courses_pkey PRIMARY KEY (id_ai_courses),
  CONSTRAINT ai_courses_series_id_fkey FOREIGN KEY (series_id) REFERENCES public.course_series(id)
);
CREATE TABLE public.certificate (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  pdf_url text NOT NULL,
  issued_at timestamp with time zone DEFAULT now(),
  CONSTRAINT certificate_pkey PRIMARY KEY (id),
  CONSTRAINT certificate_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.ai_courses(id_ai_courses),
  CONSTRAINT certificate_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profile(id)
);
CREATE TABLE public.chatbot_faq (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question USER-DEFINED NOT NULL UNIQUE,
  answer text NOT NULL,
  category text NOT NULL DEFAULT 'general'::text,
  priority integer NOT NULL DEFAULT 1 CHECK (priority >= 1 AND priority <= 3),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT chatbot_faq_pkey PRIMARY KEY (id)
);
CREATE TABLE public.community_comment (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  comment text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_comment_pkey PRIMARY KEY (id),
  CONSTRAINT community_comment_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.community_post(id),
  CONSTRAINT community_comment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profile(id)
);
CREATE TABLE public.community_post (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_post_pkey PRIMARY KEY (id),
  CONSTRAINT community_post_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profile(id)
);
CREATE TABLE public.course_chat (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  user_id uuid NOT NULL,
  message text,
  media_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT course_chat_pkey PRIMARY KEY (id),
  CONSTRAINT course_chat_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.ai_courses(id_ai_courses),
  CONSTRAINT course_chat_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profile(id)
);
CREATE TABLE public.course_instructor (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  CONSTRAINT course_instructor_pkey PRIMARY KEY (id),
  CONSTRAINT course_instructor_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id),
  CONSTRAINT course_instructor_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.ai_courses(id_ai_courses)
);
CREATE TABLE public.course_module (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  session_id smallint,
  title text NOT NULL,
  description text,
  position smallint DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  ai_feedback text,
  CONSTRAINT course_module_pkey PRIMARY KEY (id),
  CONSTRAINT course_module_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.ai_courses(id_ai_courses)
);
CREATE TABLE public.course_series (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT course_series_pkey PRIMARY KEY (id)
);
CREATE TABLE public.dimension_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  dimension USER-DEFINED NOT NULL,
  min_incl integer NOT NULL,
  max_incl integer NOT NULL,
  message text NOT NULL,
  CONSTRAINT dimension_feedback_pkey PRIMARY KEY (id)
);
CREATE TABLE public.enrollment (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  status text DEFAULT 'activo'::text CHECK (status = ANY (ARRAY['activo'::text, 'completado'::text, 'cancelado'::text])),
  enrolled_at timestamp with time zone DEFAULT now(),
  CONSTRAINT enrollment_pkey PRIMARY KEY (id),
  CONSTRAINT enrollment_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.ai_courses(id_ai_courses),
  CONSTRAINT enrollment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profile(id)
);
CREATE TABLE public.global_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  label text NOT NULL,
  min_incl integer NOT NULL,
  max_incl integer NOT NULL,
  message text NOT NULL,
  CONSTRAINT global_feedback_pkey PRIMARY KEY (id)
);
CREATE TABLE public.glossary_term (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  term USER-DEFINED NOT NULL UNIQUE,
  definition text NOT NULL,
  category text NOT NULL DEFAULT 'general'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT glossary_term_pkey PRIMARY KEY (id)
);
CREATE TABLE public.media_resource (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_type text CHECK (owner_type = ANY (ARRAY['curso'::text, 'modulo'::text, 'actividad'::text, 'comunidad'::text, 'noticia'::text])),
  owner_id uuid NOT NULL,
  type text CHECK (type = ANY (ARRAY['video'::text, 'documento'::text, 'audio'::text, 'imagen'::text])),
  source text CHECK (source = ANY (ARRAY['interno'::text, 'externo'::text])),
  url text NOT NULL,
  format text,
  size bigint,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT media_resource_pkey PRIMARY KEY (id)
);
CREATE TABLE public.metricas_prueba (
  id integer NOT NULL DEFAULT nextval('metricas_prueba_id_seq'::regclass),
  fecha timestamp without time zone NOT NULL,
  valor integer NOT NULL,
  CONSTRAINT metricas_prueba_pkey PRIMARY KEY (id)
);
CREATE TABLE public.module_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL,
  type text CHECK (type = ANY (ARRAY['individual'::text, 'colaborativa'::text])),
  content_type text CHECK (content_type = ANY (ARRAY['texto'::text, 'documento'::text, 'video'::text, 'cuestionario'::text])),
  resource_url text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  ai_feedback text,
  CONSTRAINT module_activity_pkey PRIMARY KEY (id),
  CONSTRAINT module_activity_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.course_module(id)
);
CREATE TABLE public.password_reset_token (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token_hash text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  CONSTRAINT password_reset_token_pkey PRIMARY KEY (id),
  CONSTRAINT password_reset_token_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.profile (
  id uuid NOT NULL,
  cohort_id uuid,
  email text,
  first_name text,
  last_name text,
  display_name text DEFAULT NULLIF(TRIM(BOTH FROM ((COALESCE(first_name, ''::text) || ' '::text) || COALESCE(last_name, ''::text))), ''::text),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profile_pkey PRIMARY KEY (id),
  CONSTRAINT profile_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.profile_weights (
  perfil USER-DEFINED NOT NULL,
  w_aplicacion numeric NOT NULL,
  w_conocimiento numeric NOT NULL,
  w_productividad numeric NOT NULL,
  w_estrategia numeric NOT NULL,
  w_inversion numeric NOT NULL,
  CONSTRAINT profile_weights_pkey PRIMARY KEY (perfil)
);
CREATE TABLE public.progress_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module_id uuid NOT NULL,
  progress_percent numeric DEFAULT 0,
  last_access timestamp with time zone DEFAULT now(),
  CONSTRAINT progress_tracking_pkey PRIMARY KEY (id),
  CONSTRAINT progress_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profile(id),
  CONSTRAINT progress_tracking_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.course_module(id)
);
CREATE TABLE public.question_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL,
  opt_key text NOT NULL,
  opt_text text NOT NULL,
  opt_weight numeric DEFAULT 1.0,
  CONSTRAINT question_options_pkey PRIMARY KEY (id),
  CONSTRAINT fk_qopts_question FOREIGN KEY (question_id) REFERENCES public.questions_catalog(id),
  CONSTRAINT question_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions_catalog(id)
);
CREATE TABLE public.questions_catalog (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text UNIQUE,
  perfil USER-DEFINED NOT NULL,
  area USER-DEFINED NOT NULL,
  dimension USER-DEFINED NOT NULL,
  subdomain text,
  qtype USER-DEFINED NOT NULL,
  max_options integer,
  content text NOT NULL,
  order_num integer NOT NULL DEFAULT 1000,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT questions_catalog_pkey PRIMARY KEY (id),
  CONSTRAINT fk_qc_perfil_weights FOREIGN KEY (perfil) REFERENCES public.profile_weights(perfil)
);
CREATE TABLE public.quiz (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  CONSTRAINT quiz_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.ai_courses(id_ai_courses)
);
CREATE TABLE public.quiz_question (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL,
  question_text text NOT NULL,
  options jsonb,
  correct_answer text,
  CONSTRAINT quiz_question_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_question_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quiz(id)
);
CREATE TABLE public.quiz_response (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL,
  user_id uuid NOT NULL,
  answers jsonb,
  score numeric,
  submitted_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quiz_response_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_response_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quiz(id),
  CONSTRAINT quiz_response_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profile(id)
);
CREATE TABLE public.user_profile_answers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() UNIQUE,
  nivel USER-DEFINED NOT NULL,
  area USER-DEFINED NOT NULL,
  relacion USER-DEFINED NOT NULL,
  tamano USER-DEFINED,
  sector text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_profile_answers_pkey PRIMARY KEY (id),
  CONSTRAINT user_profile_answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_question_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  question_id uuid NOT NULL,
  answer_likert smallint,
  answer_bool boolean,
  answer_text text,
  answer_opts ARRAY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_question_responses_pkey PRIMARY KEY (id),
  CONSTRAINT fk_uqr_session FOREIGN KEY (session_id) REFERENCES public.user_questionnaire_sessions(id),
  CONSTRAINT user_question_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_question_responses_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.user_questionnaire_sessions(id),
  CONSTRAINT fk_uqr_user FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT fk_uqr_question FOREIGN KEY (question_id) REFERENCES public.questions_catalog(id),
  CONSTRAINT user_question_responses_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions_catalog(id)
);
CREATE TABLE public.user_questionnaire_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  perfil USER-DEFINED NOT NULL,
  area USER-DEFINED NOT NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_questionnaire_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT user_questionnaire_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT fk_uqs_user FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT fk_uqs_perfil_weights FOREIGN KEY (perfil) REFERENCES public.profile_weights(perfil)
);
CREATE TABLE public.user_session (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  jwt_id uuid,
  issued_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  ip inet,
  user_agent text,
  revoked boolean NOT NULL DEFAULT false,
  CONSTRAINT user_session_pkey PRIMARY KEY (id),
  CONSTRAINT user_session_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username USER-DEFINED NOT NULL UNIQUE,
  email USER-DEFINED UNIQUE,
  password_hash text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_login_at timestamp with time zone,
  cargo_rol text CHECK (cargo_rol IS NULL OR (lower(btrim(cargo_rol)) = ANY (ARRAY['instructor'::text, 'administrador'::text, 'usuario'::text]))),
  type_rol text,
  first_name text,
  last_name text,
  display_name text,
  phone character varying,
  bio text,
  location text,
  profile_picture_url text,
  curriculum_url text,
  linkedin_url text,
  github_url text,
  website_url text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);