-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.extension_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT extension_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT extension_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.question_options (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  question_id bigint NOT NULL,
  option_text text NOT NULL,
  is_correct boolean NOT NULL,
  order_index smallint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  explanation text,
  CONSTRAINT question_options_pkey PRIMARY KEY (id),
  CONSTRAINT question_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id)
);
CREATE TABLE public.questions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  video_id bigint NOT NULL,
  question_text text NOT NULL,
  question_type text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT questions_pkey PRIMARY KEY (id),
  CONSTRAINT questions_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id)
);
CREATE TABLE public.subscriptions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid,
  stripe_customer_id text,
  stripe_subscription_id text,
  status USER-DEFINED NOT NULL DEFAULT 'active'::status,
  plan USER-DEFINED NOT NULL,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  canceled_at timestamp with time zone,
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.summaries (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  video_id bigint,
  content text NOT NULL DEFAULT ''::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT summaries_pkey PRIMARY KEY (id),
  CONSTRAINT summaries_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id)
);
CREATE TABLE public.user_answers (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  question_id bigint NOT NULL,
  selected_option_id bigint NOT NULL,
  text_answer text,
  is_correct boolean NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_answers_pkey PRIMARY KEY (id),
  CONSTRAINT user_answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id),
  CONSTRAINT user_answers_selected_option_id_fkey FOREIGN KEY (selected_option_id) REFERENCES public.question_options(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  email text NOT NULL,
  is_subscribed boolean NOT NULL DEFAULT false,
  monthly_video_count smallint NOT NULL DEFAULT '0'::smallint,
  last_reset_date timestamp with time zone NOT NULL DEFAULT now(),
  processsing_mode USER-DEFINED NOT NULL DEFAULT 'auto'::processing_mode,
  stripe_customer_id text UNIQUE,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.videos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  platform USER-DEFINED NOT NULL DEFAULT 'YouTube'::platform,
  title text NOT NULL,
  channel_name text,
  duration integer,
  category text,
  url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  expiry_date timestamp with time zone DEFAULT (now() + '7 days'::interval),
  video_id text,
  description text,
  deleted_at timestamp without time zone,
  CONSTRAINT videos_pkey PRIMARY KEY (id),
  CONSTRAINT videos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);