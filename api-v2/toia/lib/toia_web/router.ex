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

    resources "/stream", StreamController, only: [:index] # legacy: /api/getAllStreams
    resources "/question_suggestions", QuestionSuggestionController, only: [:index, :delete] # legacy: /api/getUserSuggestedQs, /api/removeSuggestedQ
    resources "/video", VideoController, only: [:index] # legacy: /api/getUserVideos

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
