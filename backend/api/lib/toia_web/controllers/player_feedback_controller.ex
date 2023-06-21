defmodule ToiaWeb.PlayerFeedbackController do
  use ToiaWeb, :controller

  alias Toia.PlayerFeedbacks
  alias Toia.PlayerFeedbacks.PlayerFeedback

  action_fallback ToiaWeb.FallbackController

  def index(conn, _params) do
    player_feedback = PlayerFeedbacks.list_player_feedback()
    render(conn, :index, player_feedback: player_feedback)
  end

  def create(%{assigns: %{current_user: user}} = conn, %{"video_id" => _, "question" => _, "rating" => _} = params) do
    player_feedback_params = Map.put(params, "user_id", user.id)
    with {:ok, %PlayerFeedback{} = player_feedback} <-
           PlayerFeedbacks.create_player_feedback(player_feedback_params) do
      conn
      |> put_status(:created)
      |> render(:show, player_feedback: player_feedback)
    end
  end

  def show(conn, %{"id" => id}) do
    player_feedback = PlayerFeedbacks.get_player_feedback!(id)
    render(conn, :show, player_feedback: player_feedback)
  end

  def update(conn, %{"id" => id, "player_feedback" => player_feedback_params}) do
    player_feedback = PlayerFeedbacks.get_player_feedback!(id)

    with {:ok, %PlayerFeedback{} = player_feedback} <-
           PlayerFeedbacks.update_player_feedback(player_feedback, player_feedback_params) do
      render(conn, :show, player_feedback: player_feedback)
    end
  end

  def delete(conn, %{"id" => id}) do
    player_feedback = PlayerFeedbacks.get_player_feedback!(id)

    with {:ok, %PlayerFeedback{}} <- PlayerFeedbacks.delete_player_feedback(player_feedback) do
      send_resp(conn, :no_content, "")
    end
  end
end