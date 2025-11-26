--
-- PostgreSQL database dump
--

\restrict DdvQe6tHMD3TFDNO14uYcGREN5LAvdMQ6i6WsH5nSLw8bsDNbeye9fDBu05Ec3z

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

-- Started on 2025-11-26 15:34:43

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

--
-- TOC entry 2 (class 3079 OID 46835)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 3405 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 870 (class 1247 OID 46917)
-- Name: management_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.management_role AS ENUM (
    'itManager',
    'leadership'
);


ALTER TYPE public.management_role OWNER TO postgres;

--
-- TOC entry 876 (class 1247 OID 84415)
-- Name: note_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.note_type AS ENUM (
    'normal',
    'employee_request',
    'employee_response'
);


ALTER TYPE public.note_type OWNER TO postgres;

--
-- TOC entry 861 (class 1247 OID 46878)
-- Name: note_visibility; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.note_visibility AS ENUM (
    'public',
    'internal'
);


ALTER TYPE public.note_visibility OWNER TO postgres;

--
-- TOC entry 855 (class 1247 OID 46858)
-- Name: request_priority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.request_priority AS ENUM (
    'urgent',
    'high',
    'medium',
    'low'
);


ALTER TYPE public.request_priority OWNER TO postgres;

--
-- TOC entry 858 (class 1247 OID 46868)
-- Name: request_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.request_status AS ENUM (
    'new',
    'inProgress',
    'waiting',
    'completed'
);


ALTER TYPE public.request_status OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 46846)
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    department text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    password_hash text
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 46921)
-- Name: management_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.management_accounts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    role public.management_role NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    display_name text NOT NULL,
    email text NOT NULL,
    department text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.management_accounts OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 84429)
-- Name: note_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.note_attachments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    note_id uuid NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer NOT NULL,
    file_type text NOT NULL,
    uploaded_by text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.note_attachments OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 46899)
-- Name: request_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.request_notes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    request_id uuid NOT NULL,
    author text NOT NULL,
    message text NOT NULL,
    visibility public.note_visibility DEFAULT 'internal'::public.note_visibility NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    note_type public.note_type DEFAULT 'normal'::public.note_type NOT NULL,
    parent_note_id uuid
);


ALTER TABLE public.request_notes OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 46883)
-- Name: service_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_requests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    priority public.request_priority NOT NULL,
    status public.request_status DEFAULT 'new'::public.request_status NOT NULL,
    target_sla timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_updated timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    employee_id uuid NOT NULL,
    estimated_cost numeric(15,2),
    confirmed_cost numeric(15,2)
);


ALTER TABLE public.service_requests OWNER TO postgres;

--
-- TOC entry 3395 (class 0 OID 46846)
-- Dependencies: 215
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, name, email, department, created_at, password_hash) FROM stdin;
b1102694-fd11-4ccf-a9c9-feb691ecc23a	Lê Thanh Tùng	tung-le@rmg.com.vn	Giám đốc	2025-11-11 14:33:45.268455+07	\N
3ab8d5a3-ca87-4464-a28d-709209528c7d	Nguyễn Ngọc Luyễn	luyennn@rmg.com.vn	Ban Giám Đốc	2025-11-11 14:33:45.268455+07	\N
9b41e13b-014c-43cc-b2d5-bc89f983c0be	Lê Phú Nhân	nhanlp@rmg.com.vn	Mua hàng	2025-11-11 14:33:45.268455+07	\N
509d7840-16c6-4eee-b91f-215027c9ff75	Nguyễn Sỹ Chính	cuonglp@rmg.com.vn	Cơ khí	2025-11-11 14:33:45.268455+07	\N
bd2bf3d3-874c-4561-af93-5c2253bb29d0	Nguyễn Văn Khải	khai@rmg.com.vn	Ban Giám Đốc	2025-11-11 14:33:45.268455+07	\N
72fcbf00-beae-450d-aace-b526b55d403e	Trịnh Hoài Tuấn	tuan-trinh@rmg.com.vn	DVKT	2025-11-11 14:33:45.268455+07	\N
fbc88541-78ae-4309-b8b3-71c4006d2cda	Trần Đàm Phương Thảo	trandamthuongthao1978@gmail.com	Nhân Sự	2025-11-11 14:33:45.268455+07	\N
7f6ae601-41e0-4809-befe-834d23298298	Hà Thị Minh Thi	thihtm@rmg.com.vn	Xuất nhập khẩu	2025-11-11 14:33:45.268455+07	\N
2a310f1b-d7d4-43b7-992e-840bd6b99499	Nguyễn Văn Nghiêm	nghiem@rmg.com.vn	Sản xuất & Kỹ thuật	2025-11-11 14:33:45.268455+07	\N
a8bbfcb8-8baf-4216-b5f2-fea256502a68	Cái Huy Ân	caihuyan13@gmail.com	Quản lý Sản xuất	2025-11-11 14:33:45.268455+07	\N
84dc2321-4e81-4725-9aa9-85da6b3838a9	Nguyễn Thị Ngọc Thúy	thuy-nguyen@rmg.com.vn	Kế toán	2025-11-11 14:33:45.268455+07	\N
7b97f2eb-682d-40ba-8e4c-ca5c3fc0493f	Hồ Thanh Lâm	thanhlam@rmg.com.vn	Nhân Sự	2025-11-11 14:33:45.268455+07	\N
e7d01f8e-dca6-45af-9ce9-0317bc0d9e10	Trần Thị Cúc Hoa	hoa-tran@rmg.com.vn	Kho	2025-11-11 14:33:45.268455+07	\N
ff93c912-9ef7-4a07-9a06-bbb5756982d8	Trương Thị Thanh Lịch	lichttt@rmg.com.vn	Kho	2025-11-11 14:33:45.268455+07	\N
89c99034-86d3-461d-b6d7-09d7debdcc64	Phan Hữu Nghĩa	fptnghia@gmail.com	Quản lý Sản xuất	2025-11-11 14:33:45.268455+07	\N
f586a2b0-f449-4363-bff1-c9356cb52b42	Trần Xuân Tiến	anch@rmg.com.vn	Lắp ráp	2025-11-11 14:33:45.268455+07	\N
4bdf8c82-5cad-4094-badc-44b8e359e74a	Vũ Văn Tùng	vantung@rmg.com.vn	Bán hàng	2025-11-11 14:33:45.268455+07	\N
39928757-b89d-4312-a9ac-427b479b2717	Võ Đình Chung	vodinhchung21031994@gmail.com	Điện	2025-11-11 14:33:45.268455+07	\N
9d021d3d-231a-48dd-8a26-2b0b0ce5f65d	Võ Thị Hồng Nhi	hongnhi@rmg.com.vn	HCNS	2025-11-11 14:33:45.268455+07	\N
1cbf7910-a1a1-4a22-9d01-a6c0e4c084b7	Nguyễn Ngọc Tấn	nguyenngoctan26061994@gmail.com	Điện	2025-11-11 14:33:45.268455+07	\N
317a4382-38af-4b19-bcbc-8d48180dd4ff	Phạm Văn Hưng	hung@rmg.com.vn	Thiết kế & DVKT	2025-11-11 14:33:45.268455+07	\N
6270870d-98c1-4390-a0d8-1ae519c7d06e	Nguyễn Ngọc Minh Tuấn	minhtuan@rmg.com.vn	Vận hành	2025-11-11 14:33:45.268455+07	\N
785cedf3-6003-4ebb-a25e-13c57ef6815d	Phạm Thành Long	phanthanhlong20021982@gmail.com	Cơ khí	2025-11-11 14:33:45.268455+07	\N
b868ea20-7550-4de2-86aa-c37b1fc413d5	Châu Quang Hải	hai-chau@rmg.com.vn	Ban giám đốc	2025-11-11 14:33:45.268455+07	\N
0441c78b-3f8c-4541-b2ae-ba96086a390f	Nguyễn Văn Thanh	vanthanh12378@gmail.com	HCNS	2025-11-11 14:33:45.268455+07	\N
45ae02af-5e9f-4148-b914-1d5b3b7c1e1d	Đỗ Minh Hội	dominhhoi1994@gmail.com	Cơ khí	2025-11-11 14:33:45.268455+07	\N
58be19d7-c420-44ca-9561-02965dd3eaa2	Nguyễn Lê Ngọc Tâm	ngoctam@rmg.com.vn	Quản lý Sản xuất	2025-11-11 14:33:45.268455+07	\N
e1be8016-1e81-44e7-a19f-5d2217d368f5	Nguyễn Thanh Quan	nguyenquang301215@gmail.com	Kho	2025-11-11 14:33:45.268455+07	\N
525cc07f-de9e-4d22-ae29-db0224dfb541	Phạm Tấn Thương	thuongphamengineer@gmail.com	Thiết kế	2025-11-11 14:33:45.268455+07	\N
f334cccf-5d4f-47c0-b809-e94b04692e1a	Huỳnh Phúc Văn	vanhp@rmg.com.vn	QA	2025-11-11 14:33:45.268455+07	\N
50aded66-8625-4b54-9a5a-ed81cf04391e	Hà Công Thành	hatuanphong2802@gmail.com	Bảo Vệ	2025-11-11 14:33:45.268455+07	\N
fcbe3512-bc03-49f0-9c4b-2aacbc0a71a4	Huỳnh Công Tưởng	congtuonghuynh1992@gmail.com	DVĐT	2025-11-11 14:33:45.268455+07	\N
6ef3f7bd-9346-4700-b371-fe52179eb236	Nguyễn Thị Tuyết Kiều	nguyentuyetkieu12021996@gmail.com	Kho	2025-11-11 14:33:45.268455+07	\N
83fed208-3d7d-4e87-9d1c-8f53f4d264b0	Hoàng Đình Sạch	sach@rmg.com.vn	DVKT	2025-11-11 14:33:45.268455+07	\N
d9fdc7f2-d2ac-4821-b8ad-18856b876ee1	Hồ Minh Lý	hominhly2024@gmail.com	Kết cấu	2025-11-11 14:33:45.268455+07	\N
51e010a9-cee0-4d05-a654-76cb7a7195b2	Lê Trọng Suốt	trongsuot99@gmail.com	Điện	2025-11-11 14:33:45.268455+07	\N
324db17b-345b-48ad-8348-777348d1cf89	Huỳnh Thanh Phùng	thanhphung1204@gmail.com	Thiết kế	2025-11-11 14:33:45.268455+07	\N
9ffcf801-69f4-45b5-a5d0-2f5f5fc3a2cc	Lê Hoài Trung	trunglh@rmg.com.vn	Bán hàng	2025-11-11 14:33:45.268455+07	\N
82d9cb2c-5bad-4eeb-9245-bc240642060c	Vũ Đình Quang	quangvudinh1998@gmail.com	Khuôn in	2025-11-11 14:33:45.268455+07	\N
8bc319d1-357c-4c07-8e73-f30b687aeb2f	Trần Thị Hằng	lehoanglinh211020@gmail.com	HCNS	2025-11-11 14:33:45.268455+07	\N
b9d24fab-1c99-44ae-9543-dc243a586ffd	Đinh Quang Chúc	chuc-dinh@rmg.com.vn	Thiết Kế	2025-11-11 14:33:45.268455+07	\N
e16845ce-01b3-442c-ad9d-43a47f3843c2	Nguyễn Hồng Nhớ	nguyenhongnhonghiadong@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
8e135a34-a87f-4d43-a4c3-f1f414df0e88	Trương Bảo Chung	chungtruong2612@gmail.com	Kết cấu	2025-11-11 14:33:45.268455+07	\N
6184f5e3-22ba-4a4c-835c-28954763f43b	Võ Tấn Hùng	hvo23881@gmail.com	Kết cấu	2025-11-11 14:33:45.268455+07	\N
94312f0f-c4a8-4267-b89e-224beb20d414	Hà Thanh Trường	leduyen180417@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
0c7bfef9-f5e9-468d-b613-2983866a1944	Trần Quang Vinh	vinh-tran@rmg.com.vn	Marketing	2025-11-11 14:33:45.268455+07	\N
d822272c-ff3c-4e18-872c-a843f47d12d2	Chu Văn Anh	chuvananh9424@gmail.com	QA	2025-11-11 14:33:45.268455+07	\N
a24bdb29-5635-4b30-82e1-208c706f6dc7	Nguyễn Hữu Hồng Đức	hongduc.030082@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
da659e1c-66b9-473b-ab2d-ba9ddaf2d829	Nguyễn Trung Hải	hai-nguyen@rmg.com.vn	IT	2025-11-11 14:33:45.268455+07	\N
fea41483-1fc4-47d2-975d-890139428f75	Mai Văn Mai	maivanmai676@gmail.com	HCNS	2025-11-11 14:33:45.268455+07	\N
a0ab6806-437d-441f-8c89-4b7e7c069250	Trần Nhật Thanh	thanh-tran@rmg.com.vn	Kế toán	2025-11-11 14:33:45.268455+07	\N
52a8649a-e2af-48f1-bc64-8eb461514fbc	Phạm Sỹ Hoàng	phamhoang12345678xx@gmail.com	Khuôn in	2025-11-11 14:33:45.268455+07	\N
b10e684c-b6af-44a0-bd38-94af5ce48550	Nguyễn Thái Sơn	son-nguyen@rmg.com.vn	DVĐT	2025-11-11 14:33:45.268455+07	\N
b33fda62-cd9d-4cf8-b473-11faa91aac07	Nguyễn Tấn Tài	tantai262697@gmail.com	Cơ khí	2025-11-11 14:33:45.268455+07	\N
589e6b40-1efa-4bce-baff-e4bbe5fdd2e0	Võ Thanh Ngân	2vothanhngan1991@gmail.com	Kết cấu	2025-11-11 14:33:45.268455+07	\N
527b16a4-b775-4e93-9d86-14ee58d76771	Trần Minh Đức	tranminh@duck.com	Điện	2025-11-11 14:33:45.268455+07	\N
751498bb-b6a0-496c-bfb4-f6150f77fbe5	Nguyễn Hữu Thắng	thangnguyen.020699@gmail.com	Nhân Sự	2025-11-11 14:33:45.268455+07	\N
8c6c113e-e956-47d9-aedc-f4cc36be0de0	Nguyễn Đông Thạnh	dongthanh751@gmail.com	Thiết kế	2025-11-11 14:33:45.268455+07	\N
40e23f96-61d2-4166-8982-6335d758c87d	Huỳnh Đức Trọng Tài	trongtai7734@gmail.com	DVĐT	2025-11-11 14:33:45.268455+07	\N
deb11750-98a4-4514-9f6d-ff473f664daa	Đỗ Trần Mai Thảo	thao-do@rmg.com.vn	Bán hàng	2025-11-11 14:33:45.268455+07	\N
991b0842-5b55-4c2e-ac1c-15626bbf0a7a	Nguyễn Thị Khương	ddchungbn@gmail.com	HCNS	2025-11-11 14:33:45.268455+07	\N
e2615749-db13-4dbf-80e1-a9dfd451fbcf	Đỗ Phan Phi Long	long-do@rmg.com.vn	Bán hàng	2025-11-11 14:33:45.268455+07	\N
74af9c84-c946-417a-8ddd-b299fa7f99e6	Bùi Hoàng Anh	anhanhhoang2609@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
6ce03ec5-91d7-4969-9b95-0f38a2054f81	Dương Tấn Đạt	datduong.1188@gmail.com	Lắp ráp	2025-11-11 14:33:45.268455+07	\N
f45f9c96-2a58-4367-8a2d-b79e52f70b3a	Trịnh Quốc Thắng	hang-nguyen@rmg.com.vn	Kết cấu	2025-11-11 14:33:45.268455+07	\N
59023ff7-01d4-4f9b-84fa-76f6224e434c	Lăng Hoàng Anh	anh-lang@rmg.com.vn	Tự động hoá	2025-11-11 14:33:45.268455+07	\N
ecd0185d-2d64-4a7b-8470-f914f595f508	Phan Văn Điệp	diepphan2314@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
73a4e477-c7e6-4316-9993-bef853209636	Dương Tấn Tài	duongtantai121221@gmail.com	Air bubble	2025-11-11 14:33:45.268455+07	\N
e40bba9c-981a-46b1-aa55-2961c25e8c72	Trần Quang Đức	tranquangduc160895@gmail.com	Air bubble	2025-11-11 14:33:45.268455+07	\N
0caeeb57-faee-41db-ae8e-a42a73f00333	Trần Thế Nam	nam-tran@rmg.com.vn	Thiết Kế	2025-11-11 14:33:45.268455+07	\N
de8d38ea-e73f-4516-81a3-26bb7d0922b9	Nguyễn Tài Viễn	vien-nguyen@rmg.com.vn	Sản xuất & Kỹ thuật	2025-11-11 14:33:45.268455+07	\N
58d85182-c106-4877-a22b-6d265765d3c4	Đặng Tiến Hữu	huu-dang@rmg.com.vn	Bán hàng	2025-11-11 14:33:45.268455+07	\N
70323857-e660-4a9a-b8ba-35e74269c392	Trần Văn Tâm	tamtv@rmg.com.vn	Thiết kế	2025-11-11 14:33:45.268455+07	$2a$10$QcDBGdPWWTza9Ud90HDlIuOdPlcdNiX9bNlOKtkmcz0fg1.g1EwS.
82b15c8d-8deb-4d02-9a9f-cd56cc43b648	Nguyễn Hữu Thành	huuthanh914@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
39f4ebdc-344e-4a8d-b693-cadec4c28dd4	Triệu Ngọc Thành	thanh-ngoc@rmg.com.vn	DVKT	2025-11-11 14:33:45.268455+07	\N
575181cb-3312-450e-a9b3-a99e131fa6c8	Phạm Ngọc Thọ	tho-pham@rmg.com.vn	Thiết Kế	2025-11-11 14:33:45.268455+07	\N
4ec87702-7e62-4bf3-b5c5-e5e907585b51	Nguyễn Hoàng Đô	nguyenhoangdo2000binhdinh@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
9c0ca654-fe10-4ae5-83bf-ef0aeb009552	Đỗ Minh Khang	duy-bui@rmg.com.vn	Điện	2025-11-11 14:33:45.268455+07	\N
afcb7fc2-ebc9-42ce-96bc-4aadd6d3122f	Đoàn Hoàng Phương	phuong.doanhoang0507@gmail.com	Lắp ráp	2025-11-11 14:33:45.268455+07	\N
b266e032-096b-41af-8256-5772937d6efe	Phạm Ngọc Thuận	ngocthuan27101995@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
c30a4df7-2583-4946-9867-b9f012a09304	Nguyễn Ngọc Dũng	nguyenngocdung19912020@gmail.com	Kết cấu	2025-11-11 14:33:45.268455+07	\N
79d86242-2023-4c5e-9519-f11f291d97a6	Nguyễn Trung Hiếu	hieu777.qn@gmail.com	Thiết kế	2025-11-11 14:33:45.268455+07	\N
355eb9c1-d5b2-4ba8-a58d-574a1d7d3806	Nguyễn Hoàng Duyên	duyen-nguyen@rmg.com.vn	DVKT	2025-11-11 14:33:45.268455+07	\N
0faeee70-7837-4496-87c8-3249ce206d50	Đặng Tấn Đạt	tandat25298@gmail.com	Thiết kế	2025-11-11 14:33:45.268455+07	\N
0d8c1601-66d2-4bc0-9ac6-56fe95fb6004	Trần Nhật Tâm	tam-tran@rmg.com.vn	Kỹ Sư	2025-11-11 14:33:45.268455+07	\N
c8b6d9f0-ca30-4d8d-9e36-c4aabdb425f5	Nguyễn Văn Hưng	hungpro1003@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
5cac8db0-eac1-4a90-990f-0459eadcdca3	Đoàn Hữu Hòa	hoadoan199319@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
94bf7a70-83fb-46e4-9881-e5b70e950d68	Huỳnh Ngọc Luận	luanhuynh05102000@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
c497e002-3be6-4d5c-bda7-70dd0c9e6247	Võ Ngọc Hảo	hao-vo@rmg.com.vn	Kết cấu	2025-11-11 14:33:45.268455+07	\N
faf176f1-211a-4322-97d0-888181d6acec	Nguyễn Ngọc Vương	90vuanguyen@gmail.com	Kết cấu	2025-11-11 14:33:45.268455+07	\N
2b8bf2f9-e6d8-40e5-845a-d5cde2a024a8	Nguyễn Thành Toàn	nt3327487@gmail.com	Kết cấu	2025-11-11 14:33:45.268455+07	\N
6be6dd94-25b7-4754-a353-63fefb47889c	Trịnh Hoàng Phát	phattrinh09@gmail.com	Lắp ráp	2025-11-11 14:33:45.268455+07	\N
bd8742d4-5d45-4e07-b4e8-8f784beb5cbb	Nguyễn Thị Mỹ Duyên	dnguyenthimy33@gmail.com	Kho	2025-11-11 14:33:45.268455+07	\N
fe04d9f2-94fd-493f-9551-dba27ce51004	Phạm Văn Chung	phamchungnbbn@gmail.com	Cơ khí	2025-11-11 14:33:45.268455+07	\N
2eb14183-c2fb-4aee-bd14-854f9b68de8a	Vi Đức Hoàng	hoang41112@gmail.com	Cơ khí	2025-11-11 14:33:45.268455+07	\N
d2b58d61-07f0-4f87-b496-f4389a8f6912	Bùi Minh Nhật	nhat-bui@rmg.com.vn	Bán hàng	2025-11-11 14:33:45.268455+07	\N
337465d5-033b-494b-b765-da59f4344f8d	Nguyễn Lương Đăng	dangnguyenluong@gmail.com	Cơ khí	2025-11-11 14:33:45.268455+07	\N
6dc1aa06-ed86-4498-b6a6-f1152db66dc3	Võ Hoàng Tuấn	tuan-vo@rmg.com.vn	Thiết Kế	2025-11-11 14:33:45.268455+07	\N
8f34ce1c-a376-49c3-af1b-7d24553e3003	Nguyễn Thái Bình	binh-nguyen@rmg.com.vn	Thiết kế	2025-11-11 14:33:45.268455+07	\N
caf17adb-038f-4085-a195-15de1c96323a	Trần Thị Lý	phamnhatthinh23082015@gmail.com	HCNS	2025-11-11 14:33:45.268455+07	\N
05536566-afb5-4310-9bd6-305d51d34712	Đinh Thanh Trung	dinhvohoangyen@gmail.com	Kết cấu	2025-11-11 14:33:45.268455+07	\N
1cab9f23-2961-43bc-a1a3-ea91a011394c	Hồ Đức Nhân	ducnhanckc@gmail.com	Lắp ráp	2025-11-11 14:33:45.268455+07	\N
a97e7b5d-dbed-4057-b629-6e71edbd2181	Nguyễn Vinh	vinhnguyen0825@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
036bbd76-e3ad-42dd-afea-a9d200d702d4	Trương Ngọc Hồng	svcongthuongk38@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
c7fc9730-8d96-4cc9-b5d0-440a0522b698	Hoàng Đình Đồn	9006890@gmail.com	Cơ khí	2025-11-11 14:33:45.268455+07	\N
37301637-5ab4-4970-b86d-e08083718d78	Nguyễn Cao Mạnh	caomanh8118@gmail.com	Tự động hoá	2025-11-11 14:33:45.268455+07	\N
4ac0d19c-4049-4b53-ade7-a71777231dda	Trần Minh Trung	trun9trun900@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
7b71849c-dd98-4176-8835-8125dea5804f	Huỳnh Văn Danh	gianghuynh2607@gmail.com	Lắp ráp	2025-11-11 14:33:45.268455+07	\N
6e1186ae-bb0c-447a-a622-b8d2f9b1d882	Mai Đức Phương	maiducphuong51@gmail.com	Điện	2025-11-11 14:33:45.268455+07	\N
630acac2-12b4-40ed-b2b0-c33436513060	Huỳnh Văn Thủy	k94vthuy@gmail.com	Lắp ráp	2025-11-11 14:33:45.268455+07	\N
f53d1b17-41d9-4960-902e-af8012e4586f	Văn Hoàng Long	longvan389@gmail.com	Lắp ráp	2025-11-11 14:33:45.268455+07	\N
744dbef4-ed28-4f69-b0c3-dec9d84439ee	Nguyễn Minh Khang	kzdtdh1@gmail.com	Lắp ráp	2025-11-11 14:33:45.268455+07	\N
27b74e16-0c7b-41a4-af9b-d6fb9c476ec7	Lê Bảo Long	long-le@rmg.com.vn	Thiết Kế	2025-11-11 14:33:45.268455+07	\N
97fe3f88-2c80-4b49-b777-e61549916ba2	Trần Song Em	songem12345@gmail.com	Thiết kế	2025-11-11 14:33:45.268455+07	\N
0eab6bf8-658c-4423-91d7-985bd836561a	Nguyễn Đình Thiện	thien280999@gmail.com	Mua hàng	2025-11-11 14:33:45.268455+07	\N
218494b0-1e44-420e-af1d-b2649114b2fb	Nguyễn Hoài Nam	namhoai1197@gmail.com	Thiết kế	2025-11-11 14:33:45.268455+07	\N
0508bf07-8f42-465f-b033-b4051a1b992e	Trần Quang Khá	tranquangkhackm@gmail.com	Thiết kế	2025-11-11 14:33:45.268455+07	\N
cbbe1932-3bf5-4b17-af65-fc504236efc2	Nguyễn Thành Đạt	nguyenthanhdattlbt@gmail.com	Thiết kế	2025-11-11 14:33:45.268455+07	\N
948a8511-d805-4223-9baf-6fda6d7ecf35	Hoàng Mạnh Đức	hoangmanhduccnctm224262002@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
5947eea2-ea91-4974-a752-1c29ed5f91ce	Trịnh Xuân Vinh	nguyenvuyeu2@gmail.com.	Kết cấu	2025-11-11 14:33:45.268455+07	\N
973398c0-ee6a-455d-b420-ee2d47d08b92	Nguyễn Hoàng Đức	duc-hoang@rmg.com.vn	Mua hàng	2025-11-11 14:33:45.268455+07	\N
5d07abe2-55c9-46be-a8f8-cbe11bf3ca28	Nguyễn Đức Cảnh	duccanh081001@gmail.com	Lắp ráp	2025-11-11 14:33:45.268455+07	\N
e5e7f52b-1776-42df-93a6-27a410964333	Lê Văn Vương	vuong-le@rmg.com.vn	DVKT	2025-11-11 14:33:45.268455+07	\N
aa64efb1-1a03-4d36-8dc6-b6fc8cf71561	Ngô Quốc Toàn	toan3164@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
388f08cf-7f71-4f9f-9f85-00eebe2ae671	Nguyễn Đức Tuấn	ductuan.nc.f4@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
f98397e7-ceb0-43ab-b83d-7e9aee38aba6	Trương Quốc Đạt	tqdat141@gmail.com	Lắp ráp	2025-11-11 14:33:45.268455+07	\N
42b5b452-5408-4767-a020-12a06e2b5cc9	Nguyễn Khang Điền	nkhangdien@gmail.com	Lắp ráp	2025-11-11 14:33:45.268455+07	\N
c890c2a0-64e9-4be4-b2f3-5b989add00f1	Lê Văn Danh	danh-le@rmg.com.vn	Thiết Kế	2025-11-11 14:33:45.268455+07	\N
c6b8ebc5-95c0-4426-b749-c5834b245da2	Nguyễn Tiến Khoa	nguyentienkhoamt@gmail.com	Điện	2025-11-11 14:33:45.268455+07	\N
13aeb6bf-b5c7-4674-81a4-7e9ab04a9a9e	Phạm Văn Tính	05011998vantinh@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
141d381c-ce00-46ec-99bd-f12352f51e4e	Nguyễn Hoài Thanh	hoai-thanh@rmg.com.vn	Mua hàng	2025-11-11 14:33:45.268455+07	\N
19795e33-82aa-4806-9266-c772ad15075a	Trần Anh Quốc	quoc-tran@rmg.com.vn	Bán hàng	2025-11-11 14:33:45.268455+07	\N
e2fbc1ed-26a3-4d35-90b3-e1a1c70f381f	Nguyễn Văn Long	vanlong03636938145@gmail.com	Thiết kế	2025-11-11 14:33:45.268455+07	\N
a4a5c0c3-030b-4566-a8da-94c640b1e590	Nguyễn Anh Đạt	anh-dat@rmg.com.vn	Bán hàng	2025-11-11 14:33:45.268455+07	\N
b8aea3ad-fe40-4cd9-a863-6fd093ba2600	Lê Thị Thanh Nguyên	nguyena1095@gmail.com	Mua hàng	2025-11-11 14:33:45.268455+07	\N
10484065-b16a-4c82-8eda-9dc8c91ea385	Trần Hữu Long	longthuong14020404@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
fd1be342-589d-4a08-a415-b7e0835b7f39	Nguyễn Thị Bình	nguyenthibinh8872@gmail.com	Bán hàng	2025-11-11 14:33:45.268455+07	\N
da21f463-93d9-4663-b93f-38bd5fec9a09	Nguyễn Thanh Đức	nguyenthanhduc18102002@gmail.com	Thiết kế	2025-11-11 14:33:45.268455+07	\N
aec37bdd-0a24-42a6-9650-1e6f0f90a214	Hoàng Ngọc Minh	hoangngocminh2708@gmail.com	Lắp ráp	2025-11-11 14:33:45.268455+07	\N
e2c6db86-879d-49b5-835a-464aabdfa126	Trần Đức Vân	ducvan2211@gmail.com	Lắp ráp	2025-11-11 14:33:45.268455+07	\N
b8560fca-5f45-43ef-8e83-87bc035f7beb	Lê Thị Tuyết Ngân	lengan03012004@gmail.com	Vận hành	2025-11-11 14:33:45.268455+07	\N
59f59607-e960-40df-8780-5d4d5ebc1e60	Cao Quang Ba	taytho1998@gmail.com	Cơ khí	2025-11-11 14:33:45.268455+07	\N
35ee2722-ad77-4bbf-ba84-3d25181ea0a0	Lê Quang Khá	quangkhaqp@gmail.com	Kết cấu	2025-11-11 14:33:45.268455+07	\N
a1db0040-8532-4237-a1d4-bb5bda36f533	Trần Ngọc Vinh	tranvinh28011997@gmail.com	Khuôn in	2025-11-11 14:33:45.268455+07	\N
b6a3bd59-146a-40fa-9eb8-1387a609d991	Nguyễn Duy Bắc	caubuon1998z@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
70cf122d-d5a8-44f7-abf5-d4064380b56d	Nguyễn Thọ Phương	thophuong9g@gmail.com	Khuôn in	2025-11-11 14:33:45.268455+07	\N
5954d7d9-224e-4616-82f8-2f979a9c4df4	Vũ Văn Thắng	chucvan1993@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
a8c4ad5b-6d52-49f4-b817-c75838bd2bda	Bùi Thúy An	buithuyan1992nhimy@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
fd8ebbb1-3632-4f2d-ba6b-9bef490d0dc2	Lê Nhật Trường	truong.lenhat86@gmail.com	DVĐT	2025-11-11 14:33:45.268455+07	\N
53d08137-235d-4294-b161-6d0477c3b738	Nông Thanh Nguyễn	cunguyenms@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
8a7da73f-6a3b-407d-aa8b-7d02ccb711d8	Nguyễn Tấn Tùng	tantung.nina@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
8e38965b-eb03-4543-8d9b-1f863b9d8ec8	Hoàng Mạnh Tùng	buitruongminhlong206@gmail.com	Cơ Khí	2025-11-11 14:33:45.268455+07	\N
77a6d4b5-6b96-4144-b631-9b8401b2ea6c	Nguyễn Kế Trọng	ketrong1999@gmail.com	Thiết kế	2025-11-11 14:33:45.268455+07	\N
b577794b-4ae1-4c2b-9078-df9467a78c6a	Lê Thị Quỳnh	lethiquynh3703@gmail.com	Khuôn in	2025-11-11 14:33:45.268455+07	\N
73b193b5-9433-4043-b52c-8714eee4b87f	Lê Tuấn Anh	letuananh122001@gmail.com	Tự động hoá	2025-11-11 14:33:45.268455+07	\N
7d6c0807-7d9e-4c0a-b20f-f090d8c2c6e2	Vũ Thị Mai Phương	phuong-vu@rmg.com.vn	Mua Hàng	2025-11-11 14:33:45.268455+07	\N
5b19fdb7-ab09-45a7-9cb5-b0c9ac1a6cb4	Chu Đức Định	ducdinh@rmg.com.vn	Kỹ Sư	2025-11-11 14:33:45.268455+07	\N
86c1e659-2326-402a-b766-87b374e7eec1	Dương Gia Huy	dghuy1110@gmail.com	Lắp ráp	2025-11-11 14:33:45.268455+07	\N
94131b88-38a7-4c63-a662-272b59a007fb	Trần Thái Quyền	tranthaiquyen102mt@gmail.com	Lắp ráp	2025-11-11 14:33:45.268455+07	\N
62e7060a-5432-441c-b399-e541adc886ae	Trịnh Thị Hương	huong-trinh@rmg.com.vn	Kế toán	2025-11-11 14:33:45.268455+07	\N
d4684430-f887-4e8f-9258-12a76717135d	Phạm Nguyễn Phước Đức	phuocduc151003@gmail.com	Điện	2025-11-11 14:33:45.268455+07	\N
fc64c1d4-efd5-4878-bea8-6d20ca5a8ea1	Bùi Thanh Phong	mr.phongvn2k3@gmail.com	Kết cấu	2025-11-11 14:33:45.268455+07	\N
a30e0af3-15b0-43cb-93a1-918c36da16a9	Trịnh Thị Xuân Hoa	hoa-trinh@rmg.com.vn	Kỹ Sư	2025-11-11 14:33:45.268455+07	\N
c8b7b490-82bd-4d07-95db-1c511f0f12e6	Nguyễn Viết Quân	nguyenvietquan.rmg@gmail.com	DVKT	2025-11-11 14:33:45.268455+07	\N
0bbdcc7a-52a2-4659-853c-b085077abbf1	Lương Quốc Hạ	lquocha9@mail.com	CNC	2025-11-11 14:33:45.268455+07	\N
8a9bca4c-f00f-4c24-ac8b-7e5a8a1c1c7c	Tô Thanh Mạnh	tothanhmanh16122008@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
2cacfc71-ee09-4777-a5dd-78646933d9ac	Nguyễn Văn Nghiêm	nnnnghiem@gmail.com	Điện	2025-11-11 14:33:45.268455+07	\N
1d8fde6b-80d7-4486-a154-7a8821e9e073	Vi Văn Thương	vivanthuong20122000@gmail.com	Cơ khí	2025-11-11 14:33:45.268455+07	\N
ab6a2ba5-6781-4800-8866-3e394cde4bd6	Phan Đức Thắng	phanthang041291@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
a4936e2f-2469-4c69-87be-1ed7d2a7ae9e	Nguyễn Chí Thành	nguyenchi072018@gmail.com	Lắp ráp	2025-11-11 14:33:45.268455+07	\N
f5f0b02b-fb84-42b1-836c-1e32ee946cb2	Vương Bội Kim	boikimkt@rmg.com.vn	Kế toán	2025-11-11 14:33:45.268455+07	\N
a94aabf0-49ec-4769-9b43-efceda211257	Nguyễn Thị Mỹ Duyên	myduyenkt@rmg.com.vn	Kế toán	2025-11-11 14:33:45.268455+07	\N
3483dc52-4360-43e4-9b82-820f647b4ad3	Đinh Văn Quyến	vanquyen1994qn1010@gmail.com	Điện	2025-11-11 14:33:45.268455+07	\N
e6c922ca-d70f-417b-b969-d4b96e95adb0	Nguyễn Quang Huy	qhuy3038@gmail.com	Cơ Khí	2025-11-11 14:33:45.268455+07	\N
ae66a36f-662d-4b3a-a46b-e47f63a8e570	Lê Thế Thanh	lethethanh30092003@gmail.com	Lắp ráp	2025-11-11 14:33:45.268455+07	\N
6c80c90b-8f4b-4948-a806-96796af00c28	Đặng Đức Lợi	ducloi251202@gmail.com	Điện	2025-11-11 14:33:45.268455+07	\N
3e358921-d4ff-4853-aff9-d114c04d3265	Nguyễn Chiến Thắng	thangeovi2004@gmail.com	Điện	2025-11-11 14:33:45.268455+07	\N
f268b8e5-7872-4c44-aef4-5e08d1c86c32	Võ Thị Kim Duyên	vothikimduyenpc@gmail.com	Mua Hàng	2025-11-11 14:33:45.268455+07	\N
5cdad075-db4d-4b3c-afda-d745123d0b60	Nguyễn Nhân Hậu	narutukenarutuke@gmail.com	Lắp ráp	2025-11-11 14:33:45.268455+07	\N
872b22de-d3e6-40d0-a62f-1fa56e62de6b	Quách Hoàng Thị Hồng Ấn	hongan@rmg.com.vn	Vận hành	2025-11-11 14:33:45.268455+07	\N
d79a002c-bbf7-42e4-addc-632506f7c1e9	Nguyễn Tuấn Dương	duongnguyentuan18@gmail.com	Tự động hoá	2025-11-11 14:33:45.268455+07	\N
338cf06a-506c-412c-88c2-ee6fb17d292c	Cao Danh Hiệu	hieucao809@gmail.com	Kết cấu	2025-11-11 14:33:45.268455+07	\N
3d68d5fe-d97e-411f-bf90-759e064da911	Nguyễn Thiện Hào	haonguyenthien2k4@gmail.com	Thiết kế	2025-11-11 14:33:45.268455+07	\N
78fee451-c048-4db9-a6a2-1d5d30585ca9	Hoàng Văn Minh	161019minh@gmail.com	Cơ Khí	2025-11-11 14:33:45.268455+07	\N
64742c59-935d-47e4-be4c-94b190bf55c9	Nguyễn Huỳnh Quốc Thắng	qthang585354@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
40fe3d16-81b3-485f-9565-3234782dc61b	Lê Quang Phú	quangphu2003bt@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
e2ae4fa7-d15a-4083-a05c-baa71f9764ac	Nguyễn Đình Vũ	vu-nguyen@rmg.com.vn	QA	2025-11-11 14:33:45.268455+07	\N
69551404-a555-4e6e-9eb6-b993f6c0b974	Phan Thế Thịnh	phanthethinh54@gmail.com	Kết cấu	2025-11-11 14:33:45.268455+07	\N
8ce70f3e-6bff-45f8-86fa-29d711674ad6	Trần Quang Huy	htranquang900@gmail.com	Kết cấu	2025-11-11 14:33:45.268455+07	\N
666ebb14-6d0a-4e16-bc52-d664ff45978d	Hà Văn Hoàng	0328766191hh@gmail.com	Cơ Khí	2025-11-11 14:33:45.268455+07	\N
0d696f3f-89a7-4333-9e48-e2d82eabac32	Trần Đình Cung	cungtran0912@gmail.com	Điện	2025-11-11 14:33:45.268455+07	\N
d020c427-349c-41fe-aa0d-9157a0a8e524	Trương Lê Quỳnh Trang	trang.tlq@gmail.com	Kế Toán	2025-11-11 14:33:45.268455+07	\N
f4a64820-5690-474e-816f-b754c4b9530c	Lô Xuân Quang	quangloxuan979@gmail.com	Cơ Khí	2025-11-11 14:33:45.268455+07	\N
692e2eac-f4dd-4a3e-a21f-0389c77f482e	Diệp Tuấn Khanh	dieptuankhanh98@gmail.com	QA	2025-11-11 14:33:45.268455+07	\N
2602b4a8-7e5f-412c-bd55-0fa8ec59bd4e	Nguyễn Trọng Quang	trongquang-qn@rmg.com.vn	Tự động	2025-11-11 14:33:45.268455+07	\N
0ab65703-d641-4649-b2ae-70c29dac4b61	Triệu Đức Tình	trieuductinh80@gmail.com	Cơ Khí	2025-11-11 14:33:45.268455+07	\N
cecd566a-0ee2-4acb-8eba-59074c4a83b9	Đặng Khải Phượng	dangkhaiphuong1991bk@gmail.com	Cơ Khí	2025-11-11 14:33:45.268455+07	\N
bd8ab280-5ca6-4c39-9c71-08c1c3441b0a	Nguyễn Quốc Hiếu	ngquochieu2003@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
9e3ac4a9-65d9-4d08-9ae8-e4a5a29e12f6	Đào Văn Long	daovanlong2024@gmail.com	CNC	2025-11-11 14:33:45.268455+07	\N
c687073d-89a5-497e-bb9c-09ac1752db3c	Lê Hữu Chung	lechung0611@gmail.com	Cơ khí	2025-11-11 14:33:45.268455+07	\N
f9468373-2d4e-4323-a47b-eb5de4147176	Trần Minh Thiện	mthientr2003@gmail.com	Điện	2025-11-11 14:33:45.268455+07	\N
a1ec944a-5202-4391-a002-33e860044ce8	Vũ Tuấn Kha	khavu2412@gmail.com	Điện	2025-11-11 14:33:45.268455+07	\N
39c567be-3628-42ba-9713-1b99515d3361	Bùi Đăng Sủng	sung@rmg.com.vn	RMG123@	2025-11-11 14:33:45.268455+07	$2a$10$4JtFNda2dUGB.vLOgD22Ae79KHvKrfqIEQssGQepRQH.qOGWcvNR.
ff619fca-fd8a-4371-9d42-f535321877da	Nguyễn Văn An	nguyen.van.an@rmg123.com	Marketing	2025-11-21 10:45:42.448653+07	$2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W
179f7848-5bdd-453e-8ba7-8a396873c535	Trần Thị Bình	tran.thi.binh@rmg123.com	Sales	2025-11-21 10:45:42.448653+07	$2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W
cb63ba84-a07e-48f8-8440-ed5c794bbcf9	Lê Văn Cường	le.van.cuong@rmg123.com	HR	2025-11-21 10:45:42.448653+07	$2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W
29cda30a-2a30-44d0-ae50-dd7a60d1963e	Phạm Thị Dung	pham.thi.dung@rmg123.com	Finance	2025-11-21 10:45:42.448653+07	$2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W
4a03a2b9-56f2-41e4-8662-381466823c42	Hoàng Văn Em	hoang.van.em@rmg123.com	Operations	2025-11-21 10:45:42.448653+07	$2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W
0ad76735-254b-4d8b-b5e4-7e6b5edd2642	Vũ Thị Phương	vu.thi.phuong@rmg123.com	Marketing	2025-11-21 10:45:42.448653+07	$2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W
64618369-d4e8-4992-be45-838cbfd7ed79	Đặng Văn Giang	dang.van.giang@rmg123.com	IT	2025-11-21 10:45:42.448653+07	$2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W
fa095c74-466c-4409-bc3f-077b61a70e4b	Bùi Thị Hoa	bui.thi.hoa@rmg123.com	HR	2025-11-21 10:45:42.448653+07	$2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W
\.


--
-- TOC entry 3398 (class 0 OID 46921)
-- Dependencies: 218
-- Data for Name: management_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.management_accounts (id, role, username, password_hash, display_name, email, department, created_at, updated_at) FROM stdin;
5d98d232-1487-495c-99e8-b0459325abcd	leadership	thanhtung	$2a$10$e6Noroxk3Cr50zR1Xst6OeCf7GG/4PxxvAwWzRjRK8NTF9M0u8jhm	Lê Thanh Tùng	le.thanh.tung@rmg123.com	Điều hành	2025-11-26 09:18:48.084626+07	2025-11-26 15:03:00.649547+07
e30493e9-4763-4c01-8618-fe9a329489f7	itManager	it	$2a$10$QUOaVX84X8Kn8sEk2sfhCexhPmyOJLZEQy6VJDtoAogCf0RiC0lPS	Quản lý IT	it.manager@rmg123.com	IT Operations	2025-11-11 15:25:38.810887+07	2025-11-26 09:14:56.184101+07
0c2df4a1-4e94-4f80-95bd-2b53833a7622	leadership	leadership	$2a$10$DBlZ7.M4P9qP.rZKFQ8WL.XpwSYZwGfBVcTiT5Tdm42WSd8BRzSBW	Ban Lãnh Đạo	leadership@rmg123.com	Điều hành	2025-11-11 15:25:38.877879+07	2025-11-26 09:14:56.274857+07
83d04ef2-7155-4139-a326-7729a88daafa	itManager	trunghai	$2a$10$k.5t09UB1ydwChK9SKYoHuiglexFWswZvDo4NHotGWAoVtfTvvLxO	Nguyễn Trung Hải	nguyen.trung.hai@rmg123.com	IT Operations	2025-11-26 09:18:48.020302+07	2025-11-26 15:03:00.577182+07
\.


--
-- TOC entry 3399 (class 0 OID 84429)
-- Dependencies: 219
-- Data for Name: note_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.note_attachments (id, note_id, file_name, file_path, file_size, file_type, uploaded_by, created_at) FROM stdin;
949961dd-53de-4b99-8985-a3e46822072c	d85d14ba-1ebf-47c1-b2a0-11f423cbd666	Thu-Tuyen-Dung-Tháº¯ng-Nguyá»n-1763633867151.pdf	/uploads/66daf90f-9ddc-46aa-93d4-de7e01ed4f6b-Thu-Tuyen-Dung-Tháº¯ng-Nguyá»n-1763633867151.pdf	50158	application/pdf	Trần Văn Tâm	2025-11-26 14:21:42.891237+07
\.


--
-- TOC entry 3397 (class 0 OID 46899)
-- Dependencies: 217
-- Data for Name: request_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.request_notes (id, request_id, author, message, visibility, created_at, note_type, parent_note_id) FROM stdin;
d2190b27-ed45-4659-ac14-e579dabaeaed	bb46ce47-fc35-44b6-9948-60983ae1a2ea	Nguyễn Trung Hải, nhân viên IT	dfbdfb	public	2025-11-26 13:10:32.642643+07	employee_request	\N
bb7164bf-bb86-4aa4-bb68-4dbe98d6edb7	bb46ce47-fc35-44b6-9948-60983ae1a2ea	Nguyễn Trung Hải, nhân viên IT	dfbdfb	public	2025-11-26 13:10:54.030653+07	employee_request	\N
32f75983-7385-4b0c-9350-affb68417543	bb46ce47-fc35-44b6-9948-60983ae1a2ea	Nguyễn Trung Hải, nhân viên IT	dfbdfb	public	2025-11-26 13:10:59.824436+07	employee_request	\N
7dddc2ea-c40a-465c-97ff-549f41ee5fdb	bb46ce47-fc35-44b6-9948-60983ae1a2ea	Nguyễn Trung Hải, nhân viên IT	dfbdfbdfbdfbfdb	public	2025-11-26 13:11:04.805341+07	employee_request	\N
798431e5-1249-4060-8e0d-072c4e73d179	bb46ce47-fc35-44b6-9948-60983ae1a2ea	Nguyễn Trung Hải, nhân viên IT	bổ sung dùm cái	public	2025-11-26 13:20:23.126164+07	employee_request	\N
d85d14ba-1ebf-47c1-b2a0-11f423cbd666	bb46ce47-fc35-44b6-9948-60983ae1a2ea	Trần Văn Tâm	Đã đính kèm file	public	2025-11-26 14:21:42.884101+07	employee_response	798431e5-1249-4060-8e0d-072c4e73d179
\.


--
-- TOC entry 3396 (class 0 OID 46883)
-- Dependencies: 216
-- Data for Name: service_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_requests (id, title, type, description, priority, status, target_sla, created_at, last_updated, completed_at, employee_id, estimated_cost, confirmed_cost) FROM stdin;
bb46ce47-fc35-44b6-9948-60983ae1a2ea	fgnfgn	Hỗ trợ phần mềm	fgnfgn	urgent	inProgress	2025-11-26 17:10:22.541+07	2025-11-26 13:10:22.571481+07	2025-11-26 14:21:42.877705+07	\N	70323857-e660-4a9a-b8ba-35e74269c392	\N	\N
\.


--
-- TOC entry 3230 (class 2606 OID 46856)
-- Name: employees employees_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_email_key UNIQUE (email);


--
-- TOC entry 3232 (class 2606 OID 46854)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- TOC entry 3243 (class 2606 OID 46930)
-- Name: management_accounts management_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.management_accounts
    ADD CONSTRAINT management_accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 3245 (class 2606 OID 46932)
-- Name: management_accounts management_accounts_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.management_accounts
    ADD CONSTRAINT management_accounts_username_key UNIQUE (username);


--
-- TOC entry 3248 (class 2606 OID 84437)
-- Name: note_attachments note_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note_attachments
    ADD CONSTRAINT note_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 3240 (class 2606 OID 46908)
-- Name: request_notes request_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_notes
    ADD CONSTRAINT request_notes_pkey PRIMARY KEY (id);


--
-- TOC entry 3235 (class 2606 OID 46893)
-- Name: service_requests service_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 3241 (class 1259 OID 46933)
-- Name: idx_management_accounts_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_management_accounts_role ON public.management_accounts USING btree (role);


--
-- TOC entry 3246 (class 1259 OID 84443)
-- Name: idx_note_attachments_note_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_note_attachments_note_id ON public.note_attachments USING btree (note_id);


--
-- TOC entry 3236 (class 1259 OID 84427)
-- Name: idx_request_notes_parent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_request_notes_parent ON public.request_notes USING btree (parent_note_id);


--
-- TOC entry 3237 (class 1259 OID 46915)
-- Name: idx_request_notes_request; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_request_notes_request ON public.request_notes USING btree (request_id);


--
-- TOC entry 3238 (class 1259 OID 84428)
-- Name: idx_request_notes_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_request_notes_type ON public.request_notes USING btree (note_type);


--
-- TOC entry 3233 (class 1259 OID 46914)
-- Name: idx_service_requests_employee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_service_requests_employee ON public.service_requests USING btree (employee_id);


--
-- TOC entry 3252 (class 2606 OID 84438)
-- Name: note_attachments note_attachments_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note_attachments
    ADD CONSTRAINT note_attachments_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.request_notes(id) ON DELETE CASCADE;


--
-- TOC entry 3250 (class 2606 OID 84422)
-- Name: request_notes request_notes_parent_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_notes
    ADD CONSTRAINT request_notes_parent_note_id_fkey FOREIGN KEY (parent_note_id) REFERENCES public.request_notes(id) ON DELETE SET NULL;


--
-- TOC entry 3251 (class 2606 OID 46909)
-- Name: request_notes request_notes_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_notes
    ADD CONSTRAINT request_notes_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.service_requests(id) ON DELETE CASCADE;


--
-- TOC entry 3249 (class 2606 OID 46894)
-- Name: service_requests service_requests_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


-- Completed on 2025-11-26 15:34:43

--
-- PostgreSQL database dump complete
--

\unrestrict DdvQe6tHMD3TFDNO14uYcGREN5LAvdMQ6i6WsH5nSLw8bsDNbeye9fDBu05Ec3z

