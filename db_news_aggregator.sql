--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Ubuntu 14.17-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.17 (Ubuntu 14.17-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: l0c4l
--

CREATE TABLE public.user_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    preference character varying(255),
    user_id uuid NOT NULL
);


ALTER TABLE public.user_preferences OWNER TO l0c4l;

--
-- Name: users; Type: TABLE; Schema: public; Owner: l0c4l
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password text NOT NULL
);


ALTER TABLE public.users OWNER TO l0c4l;

--
-- Name: users unique_email; Type: CONSTRAINT; Schema: public; Owner: l0c4l
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_email UNIQUE (email);


--
-- Name: user_preferences unique_preference; Type: CONSTRAINT; Schema: public; Owner: l0c4l
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT unique_preference UNIQUE (preference);


--
-- Name: users user_email_key; Type: CONSTRAINT; Schema: public; Owner: l0c4l
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: users user_pkey; Type: CONSTRAINT; Schema: public; Owner: l0c4l
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: user_preferences user_preference_pkey; Type: CONSTRAINT; Schema: public; Owner: l0c4l
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preference_pkey PRIMARY KEY (id);


--
-- Name: user_preferences user_preference_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: l0c4l
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preference_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

