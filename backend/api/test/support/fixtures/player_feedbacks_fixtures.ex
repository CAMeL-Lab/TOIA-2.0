defmodule Toia.PlayerFeedbacksFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Toia.PlayerFeedbacks` context.
  """

  @doc """
  Generate a player_feedback.
  """
  def player_feedback_fixture(attrs \\ %{}) do
    {:ok, player_feedback} =
      attrs
      |> Enum.into(%{
        question: "some question",
        rating: 42,
        video_id: "some video_id"
      })
      |> Toia.PlayerFeedbacks.create_player_feedback()

    player_feedback
  end
end
