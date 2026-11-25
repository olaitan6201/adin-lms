-- Exercise every table added since the original 7259a81 source.
INSERT INTO grading_policy_items (id,policy_id,assessment_item_id,position,title,kind,weight_percent,maximum_score)
SELECT '019aaa00-0000-7000-8000-000000000021',g.policy_id,i.id,1,i.title,i.kind,i.weight_percent,i.maximum_score
FROM assessment_items i JOIN gradebooks g ON g.id=i.gradebook_id WHERE i.id='019aaa00-0000-7000-8000-000000000003';
INSERT INTO assessment_criterion_feedback (id,score_id,criterion_key,criterion_title,level_key,level_label,points,position)
VALUES ('019aaa00-0000-7000-8000-000000000022','019aaa00-0000-7000-8000-000000000008','clarity','Clarity','clear','Clear',1,1);
INSERT INTO privacy_case_files (id,reference,kind,stage,evidence,owner_id)
SELECT '019aaa00-0000-7000-8000-000000000023','CASE-TEST','access','open','fixture',id FROM users WHERE email='officer@demo.example.test';
INSERT INTO student_photos (id,student_id,jpeg_base64)
SELECT '019aaa00-0000-7000-8000-000000000024',id,'fixture' FROM students WHERE external_student_id='DEMO-TUNDE';
INSERT INTO teaching_plans (id,offering_id,author_id,revision,status,snapshot,submitted_at)
SELECT '019aaa00-0000-7000-8000-000000000025',o.id,u.id,1,'submitted','{}','2025-01-05'
FROM offerings o CROSS JOIN users u WHERE o.external_offering_id='DEMO-CSC101-2026-1' AND u.email='officer@demo.example.test';
INSERT INTO scorm_packages (id,offering_id,title,lesson)
SELECT '019aaa00-0000-7000-8000-000000000026',id,'Transfer test','Fixture' FROM offerings WHERE external_offering_id='DEMO-CSC101-2026-1';
INSERT INTO scorm_progress (id,package_id,enrolment_id,state,expires_at)
SELECT '019aaa00-0000-7000-8000-000000000027','019aaa00-0000-7000-8000-000000000026',id,'{}','2025-01-05'
FROM enrolments WHERE status='withdrawn';
