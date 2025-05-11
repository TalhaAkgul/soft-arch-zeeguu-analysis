---
config:
  theme: mc
  look: classic
---
graph TD
  .. --> .._src
  .._zeeguu --> .._zeeguu_api
  .._zeeguu_api --> .._zeeguu_api_endpoints
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_accounts.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_activity_tracking.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_article.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_bookmarks_and_words.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_exercise_sessions.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_exercises.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_feature_toggles.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_nlp.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_own_texts.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_reading_sessions.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_search.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_sessions.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_speech.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_student.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_system_languages.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_teacher_dashboard
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_topics.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_translation.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_user.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_user_article.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_user_articles.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_user_languages.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_user_notifications.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_user_preferences.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_user_statistics.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_user_video.py
  .._zeeguu_api_endpoints --> .._zeeguu_api_endpoints_user_watching_session.py
  .._src --> .._zeeguu_api_endpoints_teacher_dashboard
