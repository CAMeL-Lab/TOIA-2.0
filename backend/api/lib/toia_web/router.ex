defmodule ToiaWeb.Router do
  use ToiaWeb, :router

  pipeline :api do
    plug(:accepts, ["json"])
  end

  pipeline :auth do
    plug(ToiaWeb.Plugs.Auth)
  end

  # Unauthorized routes
  scope "/api", ToiaWeb do
    pipe_through(:api)
    # legacy: /api/saveSuggestedQuestion/:user_id
    resources("/question_suggestions", QuestionSuggestionController, only: [:create])
  end

  scope "/api/auth", ToiaWeb do
    pipe_through(:api)

    # legacy: /api/login
    post("/login", AuthController, :login)
    # legacy: /api/createTOIA
    resources("/toia_user", ToiaUserController, only: [:create])
  end

  scope "/api", ToiaWeb do
    pipe_through([:api, :auth])

    # Stream routes
    # legacy: /api/fillerVideo
    get("/stream/:id/filler", StreamController, :filler)
    # legacy: /api/player
    get("/stream/:id/next", StreamController, :next)
    # legacy: /api/getSmartQuestions
    post("/stream/:id/smart_questions", StreamController, :smart_questions)
    # legacy: /api/getAllStreams, /api/getStreamVideosCount
    resources("/stream", StreamController, only: [:index, :create, :show])

    # Question Suggestion routes
    # legacy: /api/getLastestQuestionSuggestion
    get("/question_suggestions/latest", QuestionSuggestionController, :latest)

    # legacy: /api/getUserSuggestedQs, /api/removeSuggestedQ, api/questions/suggestions/:user_id/edit, /questions/suggestions/:user_id/discard, /questions/suggestions/:user_id/pending
    resources("/question_suggestions", QuestionSuggestionController,
      only: [:index, :delete, :update]
    )

    # Video routes
    # legacy: /api/getUserVideos, /api/getVideoPlayback, /api/videos/:user_id
    resources("/video", VideoController, only: [:index, :show, :create, :update])

    # User routes
    # legacy: api/questions/onboarding/:user_id/pending, api/questions/onboarding/:user_id/completed
    get("/toia_user/questions/onboarding", ToiaUserController, :onboarding_questions)
    # legacy: /api/getUserStreams
    get("/toia_user/:user_id/streams", ToiaUserController, :streams)

    # legacy: /api/getUserVideosCount, /api/getTotalVideoDuration
    get("/toia_user/stats", ToiaUserController, :stats)
    # legacy: /api/getUserData
    get("/toia_user/", ToiaUserController, :show)
    get("/toia_user/:user_id", ToiaUserController, :show)

    # Video Question Stream routes
    # Legacy: api/questions/answered/delete
    delete("/video_question_stream", VideoQuestionStreamController, :delete)

    # Question routes
    # legacy: /api/questions/answered/:user_id, api/questions/answered/:user_id/:stream_id, api/questions/answered_filtered/:user_id/:stream_id
    get("/question/answered", QuestionController, :index_answered)

    # Player feedback routes
    # legacy: api/save_player_feedback
    resources("/player_feedback", PlayerFeedbackController, only: [:create])
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:toia, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through([:fetch_session, :protect_from_forgery])

      live_dashboard("/dashboard", metrics: ToiaWeb.Telemetry)
      forward("/mailbox", Plug.Swoosh.MailboxPreview)
    end
  end
end
