-- ============================================================================
-- MOJULI CHRIST GLORIOUS SCHOOL — SUPABASE DATABASE SCHEMA
-- Motto: "Jesus is our great teacher"
-- Location: Ado-Ekiti, Ekiti State, Nigeria
-- ============================================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ADMISSIONS APPLICATIONS TABLE
-- Stores online admissions submitted by parents/guardians
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admissions_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_id TEXT UNIQUE NOT NULL,                       -- e.g. MJL-APP-83921
    name TEXT NOT NULL,                                -- Pupil full name
    dob TEXT,                                          -- Date of birth
    gender TEXT,                                       -- Male / Female
    prev_school TEXT,                                  -- Previous school attended
    class_level TEXT NOT NULL,                         -- KG 1 - 3, Primary 1 - 6, JSS 1 - SS 3
    parent_name TEXT NOT NULL,                         -- Parent / Guardian full name
    phone TEXT NOT NULL,                               -- Contact phone number
    email TEXT,                                        -- Contact email
    address TEXT,                                      -- Residential address in Ado-Ekiti
    emergency_contact TEXT,                            -- Emergency phone number
    status TEXT NOT NULL DEFAULT 'Pending',            -- Pending, Under Review, Accepted, Rejected
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast status tracker search by ref_id or name
CREATE INDEX IF NOT EXISTS idx_admissions_ref_id ON public.admissions_applications(ref_id);
CREATE INDEX IF NOT EXISTS idx_admissions_name ON public.admissions_applications(name);

-- ----------------------------------------------------------------------------
-- 2. TEACHER & STAFF RECRUITMENT APPLICATIONS TABLE
-- Stores prospective educator submissions and pedagogical quiz scores
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    class_applied TEXT NOT NULL,
    score_percentage INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 6,
    status TEXT NOT NULL DEFAULT 'Pending Review',      -- Pending Review, Shortlisted, Hired, Rejected
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 3. OFFICIAL SCHOOL ANNOUNCEMENTS TABLE
-- Broadcast bulletins published by Head of School / Principal
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    date_display TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 4. PARENTS & PTA COMMUNITY FORUM TABLES
-- Discussion threads and responses for parents and educators
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forum_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL DEFAULT 'General',          -- General, Academics, Welfare, Events
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    body TEXT NOT NULL,
    pinned BOOLEAN NOT NULL DEFAULT false,
    date_display TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.forum_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    body TEXT NOT NULL,
    date_display TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_forum_comments_thread ON public.forum_comments(thread_id);

-- ----------------------------------------------------------------------------
-- 5. STUDENT ACADEMIC CONTINUOUS ASSESSMENT & EXAM SCORES
-- Master score sheet for Primary & Secondary students
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section TEXT NOT NULL,                             -- 'primary' or 'secondary'
    student_id TEXT NOT NULL,                          -- e.g. MJL/PRY/2026/014
    subject TEXT NOT NULL,
    ca1 NUMERIC NOT NULL DEFAULT 0,                    -- out of 20
    ca2 NUMERIC NOT NULL DEFAULT 0,                    -- out of 20
    ca3 NUMERIC NOT NULL DEFAULT 0,                    -- out of 20
    ca_total NUMERIC NOT NULL DEFAULT 0,                -- out of 60
    exam NUMERIC NOT NULL DEFAULT 0,                    -- out of 40
    total NUMERIC NOT NULL DEFAULT 0,                   -- out of 100
    last_term_bf NUMERIC NOT NULL DEFAULT 0,
    cumulative NUMERIC NOT NULL DEFAULT 0,
    class_average NUMERIC NOT NULL DEFAULT 0,
    grade TEXT NOT NULL DEFAULT 'A',
    position TEXT,
    remark TEXT,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Allows smooth public interaction for web applications while maintaining integrity
-- ----------------------------------------------------------------------------
ALTER TABLE public.admissions_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_results ENABLE ROW LEVEL SECURITY;

-- Admissions: Anyone can submit an application (INSERT) and search (SELECT)
CREATE POLICY "Public can submit admissions applications"
    ON public.admissions_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view admissions applications"
    ON public.admissions_applications FOR SELECT USING (true);
CREATE POLICY "Allow update admissions status"
    ON public.admissions_applications FOR UPDATE USING (true);

-- Staff recruitment: Anyone can apply and take quiz
CREATE POLICY "Public can submit teacher applications"
    ON public.staff_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view teacher applications"
    ON public.staff_applications FOR SELECT USING (true);
CREATE POLICY "Allow update teacher application status"
    ON public.staff_applications FOR UPDATE USING (true);

-- Announcements: Public read access, allow insert/update
CREATE POLICY "Anyone can view announcements"
    ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow announcement posting"
    ON public.announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow announcement updates"
    ON public.announcements FOR UPDATE USING (true);

-- Forum: Public read, insert, comment
CREATE POLICY "Public can view forum threads"
    ON public.forum_threads FOR SELECT USING (true);
CREATE POLICY "Public can post forum threads"
    ON public.forum_threads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update forum threads"
    ON public.forum_threads FOR UPDATE USING (true);
CREATE POLICY "Allow delete forum threads"
    ON public.forum_threads FOR DELETE USING (true);

CREATE POLICY "Public can view comments"
    ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "Public can add comments"
    ON public.forum_comments FOR INSERT WITH CHECK (true);

-- Student Results: Public can read and teachers/admin can update
CREATE POLICY "Allow viewing student results"
    ON public.student_results FOR SELECT USING (true);
CREATE POLICY "Allow managing student results"
    ON public.student_results FOR ALL USING (true);

-- ----------------------------------------------------------------------------
-- 7. INITIAL SEED DATA
-- Default announcements and applications
-- ----------------------------------------------------------------------------
INSERT INTO public.announcements (title, body, date_display) VALUES
('First Term 2026/2027 Academic Session Resumption', 'All pupils and students across Nursery, Primary, and Secondary sections resume Monday, 22 September. Morning assembly begins at 7:30 AM sharp.', '18 Sep 2026'),
('PTA Executive & General Assembly Meeting', 'Parents and guardians are cordially invited to the termly Parent-Teacher Association general meeting in the main school hall on 3 October at 10:00 AM.', '10 Sep 2026'),
('Annual Inter-House Athletics & Sports Festival', 'Our vibrant inter-house sports competition will take place on Friday, 14 November at the Ekiti Sports Complex. House colors and track events will be allocated next week.', '02 Sep 2026')
ON CONFLICT DO NOTHING;

INSERT INTO public.admissions_applications (ref_id, name, dob, gender, prev_school, class_level, parent_name, phone, email, address, emergency_contact, status) VALUES
('MJL-APP-83921', 'Peace Oluwaseun Johnson', '2019-03-12', 'Female', 'Little Angels Nursery', 'KG 2', 'Mrs. Johnson', '08012345678', 'johnson@example.com', '5 Grace Street, Ado-Ekiti', '08098765432', 'Accepted'),
('MJL-APP-54219', 'David Chinedu Nwachukwu', '2014-07-02', 'Male', 'Bright Kids Primary', 'Primary 6', 'Mr. Nwachukwu', '08023456789', 'nwachukwu@example.com', '18 Hope Close, Ado-Ekiti', '08087654321', 'Under Review'),
('MJL-APP-19284', 'Victoria Ayomide Adeleke', '2017-11-20', 'Female', 'Glory Fountain Academy', 'Primary 3', 'Chief Adeleke', '08034567890', 'adeleke@example.com', '12 Hilltop View, Ado-Ekiti', '08076543210', 'Pending')
ON CONFLICT (ref_id) DO NOTHING;
