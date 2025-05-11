graph TD
  ___src_pages_onboarding -->|POST\n/add_user/| ___zeeguu_api_endpoints_accounts_py
  ___src_articles_ClassroomArticles_js -->|GET\n/student_info| ___zeeguu_api_endpoints_student_py
  ___src_pages_Settings -->|GET\n/student_info| ___zeeguu_api_endpoints_student_py
  ___src_teacher__routing -->|GET\n/cohort_name/| ___zeeguu_api_endpoints_student_py
  ___src_teacher_myClassesPage -->|POST\n/student_activity_overview x3| ___zeeguu_api_endpoints_teacher_dashboard
  ___src_teacher_myClassesPage -->|POST\n/student_exercise_history| ___zeeguu_api_endpoints_teacher_dashboard
  ___src_teacher_myClassesPage -->|POST\n/student_words_not_studied| ___zeeguu_api_endpoints_teacher_dashboard
  ___src_teacher_myClassesPage -->|POST\n/student_learned_words| ___zeeguu_api_endpoints_teacher_dashboard
  ___src_pages_Settings -->|POST\n/join_cohort| ___zeeguu_api_endpoints_student_py
  ___src_teacher_myClassesPage -->|POST\n/student_reading_sessions| ___zeeguu_api_endpoints_teacher_dashboard
