const BASE_URL = "http://localhost:4000/api";

const API_URLS = {
	SIGN_UP: `${BASE_URL}/toia_user`,
	LOGIN: `${BASE_URL}/login`,
	CREATE_NEW_STREAM: `${BASE_URL}/stream`,
	GET_USER_STREAMS: user_id => `${BASE_URL}/toia_user/${user_id}/streams`,
	VIDEO_INFO: video_id => `${BASE_URL}/video/${video_id}`,
	ONBOARDING_QUESTIONS_LIST: `${BASE_URL}/toia_user/questions/onboarding`,
	QUESTION_SUGGESTIONS: `${BASE_URL}/question_suggestions`,
	ANSWERED_QUESTION_LIST: `${BASE_URL}/question/answered`,
	USER_STATS: `${BASE_URL}/toia_user/stats`,
	USER_INFO: `${BASE_URL}/toia_user`,
	REMOVE_VIDEO: `${BASE_URL}/video_question_stream`,
	DISCARD_SUGGESTION: question_id => `${BASE_URL}/question_suggestions/${question_id}`,
	EDIT_SUGGESTION: question_id => `${BASE_URL}/question_suggestions/${question_id}`,
};

export default API_URLS;