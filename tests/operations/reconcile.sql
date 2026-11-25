SELECT a.id, q.id, u.email, a.state, a.ordinal,
       r.revision, r.answer, r.saved_at,
       CASE WHEN s.points = 1 AND s.released_at IS NULL THEN 1 ELSE 0 END,
       a.submitted_at
FROM examination_attempts a
JOIN enrolments e ON e.id = a.enrolment_id
JOIN students st ON st.id = e.student_id
JOIN users u ON u.id = st.user_id
LEFT JOIN attempt_questions q ON q.attempt_id = a.id
LEFT JOIN examination_responses r ON r.attempt_question_id = q.id
LEFT JOIN assessment_scores s ON s.attempt_id = a.id
ORDER BY u.email, a.id, q.id, r.revision;
