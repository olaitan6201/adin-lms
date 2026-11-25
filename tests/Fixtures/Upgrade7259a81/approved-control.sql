-- Separate history row; do not edit the original pending/withdrawn fixture.
INSERT INTO grades (id,enrolment_id,policy_id,revision,total_percent,grade,approved_by,approved_at,published_at,moderation_status)
SELECT '019aaa00-0000-7000-8000-000000000011',e.id,g.policy_id,1,77.12345678,'B',
g.approved_by,g.approved_at,g.published_at,'approved'
FROM grades g JOIN enrolments old ON old.id=g.enrolment_id
JOIN enrolments e ON e.student_id=old.student_id AND e.status='registered'
WHERE g.id='019aaa00-0000-7000-8000-000000000009';
