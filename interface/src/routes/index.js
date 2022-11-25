import React from "react";
import { Route, Switch } from "react-router-dom";

import Home from "../pages/HomePage";
import SignUp from "../pages/SignUpPage";
import AvatarGarden from "../pages/AvatarGardenPage";
import AvatarLibrary from "../pages/AvatarLibraryPage";
import Settings from "../pages/AvatarStream";
import AboutUs from "../pages/AboutUsPage";
import Recorder from "../pages/Recorder";
import Player from "../pages/Player";
import EditRecorder from "../pages/EditRecorderPage";

import i18n from "i18next";
import { useTranslation, initReactI18next, Trans } from "react-i18next";


const supportedLanguages = ["en", "ar", "fr"];



const translationsEn = {
  // NavBar Language
  current_lang: "fi fi-us",
	// Structure
	alignment: '',

  // NavBar.js
  nav_welcome_back: "Welcome Back",
  nav_login_request: "Enter the following information to login to your TOIA account",
  nav_signup_request: "Don't have an Account? Sign Up",
  nav_toia: "TOIA",
  nav_about_us: "About Us",
  nav_talk_to_toia: "Talk To TOIA",
  nav_my_toia: "My TOIA",
  nav_logout: 'Logout',
  nav_login: 'Login',

	// HomePage.js
  welcome: "Welcome to",
  tagline: " communication reimagined.",

  // AboutUsPage.js
  meet_the_team: "Meet The Team",
  publications: "Publications",
  github_repo: 'Github Repo',
  product_tagline: "TOIA ... Communication Reimagined",
  product_hook1: 'Imagine being able to share your story with your great grandchildren.',
  product_hook2: 'Imagine being able to interview for thousands of jobs simultaneously.',
  product_description: 'TOIAs are interactive applications that allow communication across time and space.',
  product_purpose: 'With TOIA, you can create an online stream from the comfort of your home and connect with millions of people, anywhere in the world, anytime in the future.',
  product_summary: 'TOIA is a project created at \
  <0> New York Univeristy Abu Dhabi’s </0> \
  <1> Camel Lab. </1>',
  toia_team: "The TOIA Team",
  publication_links: "Publication Links",

  // AvatarGardenPage.js
  add_new_video: "Add new video",
  record: "Record",
  edit: "Edit",
  delete: "Delete",
  update: "Update",
  record_request: "Please record the required ones first",
  type_request: "Type something...",
  confirm: 'Are you sure?',
  notify_as_irreversible: 'This action will be irreversible',
  account_settings: "Account Settings",
  edit_account: 'Edit the following information about your account',
  // name_input: "Name: ",
  password_input: "Password: ",
  // language_input: "Language: ",
  email_input: "Email: ",
  total_videos_in_stream: "Total Videos In Stream:",
  // streamSetting?
  save: "Save",
  edit_stream: "Edit Stream",
  edit_stream_text: "Edit the following information about your stream",
  add_stream_text: "Add the following information about your stream",
  select_img: "Select image:",
  enter_steam_name: 'Enter a new stream name',
  enter_stream_purpose: 'Enter what your new stream will be about',
  video_type: "Video Type: {playbackVideoType}",
  show_question: 'Question being answered: "{playbackVideoQuestion}"',
  privacy_setting: "Privacy Settings: {playbackVideoPrivacy}",
  answer_provided: 'The answer provided:',
  search_placeholder: 'Search...',
  confirm_delete: 'Confirm Deletion',
  video_entry: "Video entry",

  greet_user: "Hi {{toiaName}}",
  my_toia_streams: "My TOIA Streams",



  // AvatarLibraryPage.js
  page_title: 'TOIA Stream Library',

  // AvatarStream.js
  name_input: "Name: ",
  privacy_input: "Privacy: ",
  privacy_option_public: "Public",
  privacy_option_private: "Private",
  language_input: "Language: ",
  bio_input: "Bio: ",
  add_video: "Add Video",

  // AvatarViewPage.js
  show_name: "Name: ",
  show_album: "Album: ",
  show_language: "Language: ",
  show_bio: "Bio: ",
  language_preference_input: "What language would you like to speak in..",

  // EditRecorderPage.js
  edit_recording_page_title: "Edit Recording",
  filler: "Filler",
  regular_answer: "Regular Answer",
  yes_or_no: "Yes or No",
  greeting: "Greeting",
  exit: "Exit",
  public: "Public",
  select_album: "Select album....",

  // Player.js
  INTERACT: "INTERACT",
  PAUSE: "PAUSE",
  skip_to_end: "Skip to End",

  // Recorder.js ModalQSuggestion
  question_suggestion_modal: "Successful! Your TOIA has been saved.",
  success_message: "Successful! Your TOIA has been saved.",
  show_suggestions: "Here are some suggestions...",
  no_suggestions: "No suggestions.",

  // Recorder.js Recorder
  privacy_tooltip: "Set the privacy of the specific video",
  add_stream: "Add Stream",
  alert_select_default_stream: "Default stream must be selected!",
  total_videos: "Total Videos",
  total_videos_length: "Total Videos Length",
  alert_record_video: "Record a video to proceed",
  record_again_button: "Record Again",
  stop_recording_tooltip: "Stop Recording",
  start_recording_tooltip: "Start Recording",
  save_video_tooltip: "Save Video",
  editing_alert: "This will create a new entry, keeping the old one unchanged!",
  save_as_new_button: "Save As New",
  update_button: "Update",
  save_video_button: "Save Video",
  // record_again_button: "Record Again",
  questions: "Question(s):",
  type_custom_question_input: "Type your own question",

  // SignUpPage.js
  signup_text: "Enter the following information to create your TOIA account",
  signup_first_name: "First Name",
  signup_last_name: "Last Name",
  signup_email: "Email",
  signup_language: "Language:",
  signup_create_password: "Create Password",
  signup_confirm_password: "Confirm Password",
  signup_upload_picture: "Upload profile picture",
};


const translationsFr = {
  // NavBar Language
  current_lang: "fi fi-fr",
	// Structure
	alignment: '',

	// HomePage.js
  welcome: "Bienvenue à",
  tagline: " communication réinventée.",

  // NavBar.js
	nav_welcome_back: "Bienvenue à nouveau",
	nav_login_request: "Entrez les informations suivantes pour vous connecter à votre compte TOIA",
	nav_signup_request: "Vous n'avez pas de compte? Inscrivez-vous",
	nav_toia: "TOIA",
	nav_about_us: "À propos de nous",
	nav_talk_to_toia: "Parler à TOIA",
	nav_my_toia: "Mon TOIA",
	nav_logout: 'Déconnexion',
	nav_login: 'Connexion',

  // AboutUsPage.js
  meet_the_team: "Rencontrer l'équipe",
  publications: "Publications",
  github_repo: 'Dépôt Sur Github',
  product_tagline: "TOIA ... Communication Réinventée.",
  product_hook1: 'Imaginez pouvoir partager votre histoire avec vos arrière-petits-enfants.',
  product_hook2: "Imaginez pouvoir passer des entretiens pour des milliers d'emplois simultanément.",
  product_description: "Les TOIAs sont des applications interactives qui permettent la communication à travers le temps et l'espace.",
  product_purpose: "Avec TOIA, vous pouvez créer un flux en ligne dans le confort de votre maison et vous connecter avec des millions de personnes, partout dans le monde, à tout moment dans le futur.",
  product_summary: 'TOIA is a project created at \
  <0>New York Univeristy Abu Dhabi’s</0>  \
  <1>Camel Lab.</1>',
  toia_team: "L'Équipe de TOIA",
  publication_links: "Liens de Publication",

  // AvatarGardenPage.js
  add_new_video: "Ajouter une nouvelle vidéo",
  re_cord: "Enregistrer",
  edit: "Modifier",
  delete: "Supprimer",
  update: "Mettre à jour",
  record_request: "Veuillez d'abord enregistrer ceux qui sont requis",
  type_request: "Tapez quelque chose...",
  confirm: 'Êtes-vous sûr?',
  notify_as_irreversible: 'Cette action sera irréversible',
  account_settings: "Paramètres du compte",
  edit_account: 'Modifiez les informations suivantes sur votre compte',
  // name_input: "Nom: ",
  password_input: "Mot de passe :",
  // language_input: "Langue: ",
  email_input: "E-mail: ",
  total_videos_in_stream: "Nombre total de vidéos dans le flux:",
  // streamSetting?
  s_ave: "Enregistrer",
  edit_stream: "Modifier le flux",
  edit_stream_text: "Modifiez les informations suivantes concernant votre flux",
  add_stream_text: "Ajoutez les informations suivantes concernant votre flux",
  select_img: "Sélectionner l'image:",
  enter_steam_name: 'Entrez un nouveau nom de flux',
  enter_stream_purpose: 'Entrez de quoi parlera votre nouveau stream',
  video_type: "Type de vidéo: {playbackVideoType}",
  show_question: 'Question en cours de réponse: "{playbackVideoQuestion}"',
  privacy_setting: "Paramètres de confidentialité: {playbackVideoPrivacy}",
  answer_provided: 'La réponse fournie:',
  search_placeholder: 'Rechercher...',
  confirm_delete: 'Confirmer la suppression',
  video_entry: "Entrée vidéo",

  greet_user: "Bonjour {{toiaName}}",
  my_toia_streams: "Mes flux TOIA",

  // AvatarLibraryPage.js
  page_title: "Bibliothèque d'avatars TOIA",

  // AvatarStream.js
  name_input: "Nom: ",
  privacy_input: "Confidentialité: ",
  privacy_option_public: "Public",
  privacy_option_private: "Privé",
  language_input: "Langue: ",
  bio_input: "Biographie: ",
  add_video: "Ajouter une vidéo",

  // AvatarViewPage.js
  show_name: "Nom: ",
  show_album: "Album: ",
  show_language: "Langue: ",
  show_bio: "Biographie: ",
  language_preference_input: "Dans quelle langue voudriez-vous parler..",

  // EditRecorderPage.js
  edit_recording_page_title: "Modifier l'enregistrement",
  filler: "Remplissage",
  regular_answer: "Réponse régulière",
  yes_or_no: "Oui ou Non",
  greetin_g: "Bonjour",
  exit: "Quitter",
  public: "Public",
  select_album: "Sélectionner un album....",

  // Player.js
  INTERACT: "INTERAGIR",
  PAUSE: "PAUSE",
  skip_to_end: "Passer à la fin",

  // Recorder.js ModalQSuggestion
  question_suggestion_modal: "Réussi! Votre TOIA a été enregistré.",
  success_message: "Réussi! Votre TOIA a été enregistré.",
  show_suggestions: "Voici quelques suggestions...",
  no_suggestions: "Aucune suggestion.",

  // Recorder.js Recorder
  privacy_tooltip: "Définir la confidentialité d'une vidéo spécifique",
  add_stream: "Ajouter un flux",
  alert_select_default_stream: "Le flux par défaut doit être sélectionné!",
  total_videos: "Nombre total de vidéos",
  total_videos_length: "Durée totale des vidéos",
  alert_record_video: "Enregistrer une vidéo pour continuer",
  record_again_button: "Enregistrer à nouveau",
  stop_recording_tooltip: "Arrêter l'enregistrement",
  start_recording_tooltip: "Démarrer l'enregistrement",
  save_video_tooltip: "Enregistrer la vidéo",
  edit_alert: "Cela va créer une nouvelle entrée, en gardant l'ancienne inchangée!",
  save_as_new_button: "Enregistrer comme nouveau",
  update_button: "Mettre à jour",
  save_video_button: "Enregistrer la vidéo",
  // record_again_button: "Enregistrer à nouveau",
  questions: "Question(s):",
  type_custom_question_input: "Tapez votre propre question",

  // SignUpPage.js
  signup_text: "Entrez les informations suivantes pour créer votre compte TOIA",
  signup_first_name: "Prénom",
  signup_last_name: "Nom de famille",
  signup_email: "E-mail",
  signup_language: "Langue:",
  signup_create_password: "Créer un mot de passe",
  signup_confirm_password: "Confirmer le mot de passe",
  signup_upload_picture: "Télécharger une photo de profil",
};


const translationsAr = {
  // NavBar Language
  current_lang: "fi fi-ae",
	// Structure
	alignment: 'right-align',

	// HomePage.js
  welcome: "مرحبا بك في" ,
  tagline: "إعادة تصور التواصل",

  // NavBar.js
	nav_welcome_back: "مرحبًا بعودتك" ,
	nav_login_request: "أدخل المعلومات التالية لتسجيل الدخول إلى حساب TOIA الخاص بك" ,
	nav_signup_request: "ليس لديك حساب؟ قم بالتسجيل" ,
	nav_toia: "TOIA",
	nav_about_us: "نبذة عنا",
	nav_talk_to_toia: "تحدث إلى TOIA" ,
	nav_my_toia: "My TOIA" ,
	nav_logout: "تسجيل الخروج" ,
	nav_login: "تسجيل الدخول" ,

  // AboutUsPage.js
  meet_the_team: "قابل الفريق",
  publications: "المنشورات",
  github_repo: 'جيثب الريبو',
  product_tagline: "TOIA ... إعادة تصور التواصل",
  product_hook1: 'تخيل أن تكون قادرًا على مشاركة قصتك مع أحفادك.',
  product_hook2: "تخيل أنك قادر على إجراء مقابلات مع آلاف الوظائف في وقت واحد.",
  product_description: 'TOIA هي تطبيقات تفاعلية تسمح بالاتصال عبر الزمان والمكان.',
  product_purpose: "باستخدام TOIA ، يمكنك إنشاء بث مباشر عبر الإنترنت وأنت مرتاح في منزلك والتواصل مع ملايين الأشخاص ، في أي مكان في العالم ، وفي أي وقت في المستقبل.",
  product_summary: 'TOIA هو مشروع تم إنشاؤه في\
  <1>Camel Lab.</1>\
  <0>جامعة نيويورك أبوظبي</0>',
  toia_team: "فريق TOIA",
  publication_links: "روابط المنشورات",

  // AvatarGardenPage.js
  add_new_video: "أضف فيديو جديد",
  record: "تسجيل" ,
  edit: "تحرير" ,
  delete: "حذف" ,
  update: "تحديث" ,
  record_request: "الرجاء تسجيل المطلوب أولاً" ,
  type_request: "اكتب شيئًا ..." ,
  confirm: "هل أنت متأكد؟" ,
  notify_as_irreversible: "سيكون هذا الإجراء لا رجوع فيه" ,
  account_settings: "إعدادات الحساب" ,
  edit_account: "قم بتحرير المعلومات التالية حول حسابك" ,
  // name_input: "الاسم:" ,
  password_input: "كلمة المرور:" ,
  // language_input: "اللغة:" ,
  email_input: "البريد الإلكتروني:" ,
  total_videos_in_stream: "إجمالي مقاطع الفيديو قيد البث:",
  // streamSetting؟
  save: "حفظ" ,
  Edit_stream: "تحرير الدفق" ,
  edit_stream_text: "قم بتحرير المعلومات التالية حول البث الخاص بك" ,
  add_stream_text: "أضف المعلومات التالية حول البث الخاص بك" ,
  select_img: "حدد صورة:" ,
  enter_steam_name: "أدخل اسم تيار جديد" ,
  enter_stream_purpose: "أدخل موضوع البث الجديد" ,
  video_type: "نوع الفيديو: {playbackVideoType}" ,
  show_question: "إجابة السؤال:\" {playbackVideoQuestion} \"",
  privacy_setting: "إعدادات الخصوصية: {playbackVideoPrivacy}",
  answer_provided: "الجواب مقدم:" ,
  search_placeholder: "بحث ...",
  Confirm_delete: "تأكيد الحذف" ,
  video_entry: "إدخال الفيديو" ,

  greet_user: "مرحبًا {{toiaName}}" ,
  my_toia_streams: "My Toia Streams" ,

  // AvatarLibraryPage.js
  page_title: "مكتبة الصور الرمزية TOIA" ,

  // AvatarStream.js
  name_input: "الاسم:" ,
  privacy_input: "الخصوصية:" ,
  privacy_option_public: "عام" ,
  privacy_option_private: "خاص" ,
  language_input: "اللغة:" ,
  bio_input: "Bio:" , /////////////////////////////////////////////////////////////////////////
  add_video: "إضافة فيديو",

  // AvatarViewPage.js
  show_name: "الاسم:" ,
  show_album: "الألبوم:" ,
  show_language: "اللغة:" ,
  show_bio: "السيرة الذاتية:" ,
  language_preference_input: "ما اللغة التي تريد التحدث بها .." ,

  // EditRecorderPage.js
  edit_recording_page_title: "تحرير التسجيل" ,
  filler: "حشو",
  regular_answer: "إجابة عادية",
  yes_or_no: "نعم أو لا" ,
  greeting: "تحية",
  exit: "خروج" ,
  public: "عام",
  select_album: "حدد الألبوم ...." ,

  // Player.js
  INTERACT: "تفاعل" ,
  PAUSE: "إيقاف مؤقت",
  skip_to_end: "تخطي إلى النهاية",

  // Recorder.js ModalQSuggestion
  question_suggestion_modal: "تم بنجاح! تم حفظ TOIA الخاص بك.",
  success_message: "تم بنجاح! تم حفظ TOIA الخاص بك.",
  show_suggestions: "إليك بعض الاقتراحات ...",
  no_suggestions: "لا توجد اقتراحات.",

  // Recorder.js Recorder
  privacy_tooltip: "ضبط خصوصية الفيديو المحدد" ,
  add_stream: "إضافة دفق" ,
  alert_select_default_stream: "يجب تحديد الدفق الافتراضي!" ,
  total_videos: "إجمالي مقاطع الفيديو",
  total_videos_length: "إجمالي طول مقاطع الفيديو",
  alert_record_video: "سجل فيديو للمتابعة" ,
  Record_again_button: "تسجيل مرة أخرى" ,
  stop_recording_tooltip: "إيقاف التسجيل" ,
  start_recording_tooltip: "بدء التسجيل" ,
  save_video_tooltip: "حفظ الفيديو" ,
  edit_alert: "سيؤدي هذا إلى إنشاء إدخال جديد ، مع الإبقاء على الإدخال القديم دون تغيير!" ,
  save_as_new_button: "حفظ باسم جديد" ,
  update_button: "تحديث",
  save_video_button: "حفظ الفيديو" ,
  // record_again_button: "تسجيل مرة أخرى" ,
  questions: "السؤال (الأسئلة):" ,
  type_custom_question_input: "اكتب سؤالك الخاص",

  // SignUpPage.js
  signup_text: "أدخل المعلومات التالية لإنشاء حساب TOIA الخاص بك" ,
  signup_first_name: "الاسم الأول",
  signup_last_name: "الاسم الأخير",
  signup_email: "البريد الإلكتروني" ,
  signup_language: "اللغة:",
  signup_create_password: "إنشاء كلمة مرور" ,
  signup_confirm_password: "تأكيد كلمة المرور" ,
  signup_upload_picture: "تحميل صورة الملف الشخصي" ,
};

i18n
.use(initReactI18next) // passes i18n down to react-i18next
.init({
  resources: {
    en: { translation: translationsEn },
    fr: { translation: translationsFr },
    ar: { translation: translationsAr },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  // debug: true,
});


export default function Routes() {
	return (
		<Switch>
			<Route path="/" exact component={Home} />
			<Route path="/signup" component={SignUp} />
			<Route path="/mytoia" component={AvatarGarden} />
			<Route path="/library" component={AvatarLibrary} />
			<Route path="/stream" component={Settings} />
			<Route path="/about" component={AboutUs} />
			<Route path="/recorder" component={Recorder} />
			<Route path="/editrecorder" component={EditRecorder} />
			<Route path="/player" component={Player} />

			{/* redirect user to SignIn page if route does not exist and user is not authenticated */}
			<Route component={Home} />
		</Switch>
	);
}
