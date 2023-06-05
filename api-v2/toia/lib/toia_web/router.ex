defmodule ToiaWeb.Router do
  use ToiaWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :auth do
    plug ToiaWeb.Plugs.Auth
  end

  scope "/api", ToiaWeb do
    pipe_through :api

    post "/login", AuthController, :login # legacy: /api/login
    resources "/toia_user", ToiaUserController, only: [:create] # legacy: /api/createTOIA

    # resources "/stream_view_permission", StreamViewPermissionController, except: [:new, :edit]
    # resources "/questions", QuestionController, except: [:new, :edit]
    # resources "/question_suggestions", QuestionSuggestionController, except: [:new, :edit]
    # resources "/video", VideoController, except: [:new, :edit]
    # resources "/videos_questions_streams", VideoQuestionStreamController, except: [:new, :edit]
    # resources "/conversations_log", ConversationLogController, except: [:new, :edit]
    # resources "/player_feedback", PlayerFeedbackController, except: [:new, :edit]
    # resources "/tracker", TrackerController, except: [:new, :edit]
  end

  scope "/api", ToiaWeb do
    pipe_through [:api, :auth]

    # Stream routes
    get "/stream/:id/filler", StreamController, :filler # legacy: /api/fillerVideo
    get "/stream/:id/next", StreamController, :next # legacy: /api/player
    get "/stream/:id/smart_questions", StreamController, :smart_questions # legacy: /api/getSmartQuestions
    resources "/stream", StreamController, only: [:index, :create] # legacy: /api/getAllStreams

    # Question Suggestion routes
    get "/question_suggestions/latest", QuestionSuggestionController, :latest # legacy: /api/getLastestQuestionSuggestion
    resources "/question_suggestions", QuestionSuggestionController, only: [:index, :delete, :create] # legacy: /api/getUserSuggestedQs, /api/removeSuggestedQ, /api/saveSuggestedQuestion/:user_id

    # Video routes
    resources "/video", VideoController, only: [:index, :show] # legacy: /api/getUserVideos

    # User routes
    get "/toia_user/:user_id/streams", ToiaUserController, :streams # legacy: /api/getUserStreams
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
      pipe_through [:fetch_session, :protect_from_forgery]

      live_dashboard "/dashboard", metrics: ToiaWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
