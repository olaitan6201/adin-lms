-- Synthetic history on the old checkout, using the seeded withdrawn learner.
UPDATE offerings SET copied_from=(SELECT id FROM (SELECT id FROM offerings WHERE external_offering_id='DEMO-CSC101-2026-1') AS original)
WHERE external_offering_id='DEMO-CSC101-2026-2';
INSERT INTO jobs (queue,payload,attempts,available_at,created_at) VALUES ('archive','{}',0,1,1);
INSERT INTO jobs (queue,payload,attempts,available_at,created_at) VALUES ('deleted','{}',0,1,1);
DELETE FROM jobs WHERE queue='deleted';
INSERT INTO grading_policies (id,name,version,rounding_rule)
VALUES ('019aaa00-0000-7000-8000-000000000001','Legacy policy',1,'half_up');
INSERT INTO gradebooks (id,offering_id,policy_id)
SELECT '019aaa00-0000-7000-8000-000000000002',offering_id,'019aaa00-0000-7000-8000-000000000001'
FROM enrolments WHERE status='withdrawn';
INSERT INTO assessment_items (id,gradebook_id,title,kind,weight_percent,maximum_score)
VALUES ('019aaa00-0000-7000-8000-000000000003','019aaa00-0000-7000-8000-000000000002','Essay','assignment',100,100);
INSERT INTO assignments (id,item_id,instructions,opens_at,due_at,closes_at,accepted_formats,max_bytes,late_policy,editable,group_work)
VALUES ('019aaa00-0000-7000-8000-000000000004','019aaa00-0000-7000-8000-000000000003','Write','2025-01-01','2025-01-07','2025-01-08','[]',1000,'{}',true,false);
INSERT INTO submissions (id,assignment_id,enrolment_id)
SELECT '019aaa00-0000-7000-8000-000000000005','019aaa00-0000-7000-8000-000000000004',id FROM enrolments WHERE status='withdrawn';
INSERT INTO submission_versions (id,submission_id,revision,receipt,submitted_at,submitted_by,body)
SELECT '019aaa00-0000-7000-8000-000000000006','019aaa00-0000-7000-8000-000000000005',1,'ARCHIVE-42','2025-01-05',user_id,'archived text'
FROM students WHERE external_student_id='DEMO-TUNDE';
INSERT INTO submission_recipients (id,version_id,enrolment_id)
SELECT '019aaa00-0000-7000-8000-000000000007','019aaa00-0000-7000-8000-000000000006',id FROM enrolments WHERE status='withdrawn';
INSERT INTO assessment_scores (id,item_id,enrolment_id,revision,points,submission_version_id,changed_at,reason)
SELECT '019aaa00-0000-7000-8000-000000000008','019aaa00-0000-7000-8000-000000000003',id,1,83.12345678,'019aaa00-0000-7000-8000-000000000006','2025-01-09','Original award'
FROM enrolments WHERE status='withdrawn';
INSERT INTO grades (id,enrolment_id,policy_id,revision,total_percent,grade,approved_by,approved_at,published_at)
SELECT '019aaa00-0000-7000-8000-000000000009',e.id,'019aaa00-0000-7000-8000-000000000001',1,83.12345678,'A',u.id,'2025-01-10','2025-01-11'
FROM enrolments e CROSS JOIN users u WHERE e.status='withdrawn' AND u.email='officer@demo.example.test';
INSERT INTO grade_inputs (id,grade_id,score_id,applied_weight,maximum_score)
VALUES ('019aaa00-0000-7000-8000-000000000010','019aaa00-0000-7000-8000-000000000009','019aaa00-0000-7000-8000-000000000008',100,100);
