defmodule ToiaWeb.PlayerFeedbackJSON do
  alias Toia.PlayerFeedbacks.PlayerFeedback

  @doc """
  Renders a list of player_feedback.
  """
  def index(%{player_feedback: player_feedback}) do
    %{data: for(player_feedback <- player_feedback, do: data(player_feedback))}
  end

  @doc """
  Renders a single player_feedback.
  """
  def show(%{player_feedback: player_feedback}) do
    %{data: data(player_feedback)}
  end

  defp data(%PlayerFeedback{} = player_feedback) do
    %{
      id: player_feedback.id,
      video_id: player_feedback.video_id,
      question: player_feedback.question,
      rating: player_feedback.rating
    }
  end
end
