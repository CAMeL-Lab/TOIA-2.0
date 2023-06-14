defmodule Toia.ConversationsLogsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Toia.ConversationsLogs` context.
  """

  @doc """
  Generate a conversation_log.
  """
  def conversation_log_fixture(attrs \\ %{}) do
    {:ok, conversation_log} =
      attrs
      |> Enum.into(%{
        ada_similarity_score: 120.5,
        filler: true,
        interactor_id: 42,
        mode: "some mode",
        question_asked: "some question_asked",
        timestamp: 42,
        video_played: "some video_played"
      })
      |> Toia.ConversationsLogs.create_conversation_log()

    conversation_log
  end
end
