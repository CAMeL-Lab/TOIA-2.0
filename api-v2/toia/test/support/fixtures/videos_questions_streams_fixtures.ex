defmodule Toia.VideosQuestionsStreamsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Toia.VideosQuestionsStreams` context.
  """

  @doc """
  Generate a video_question_stream.
  """
  def video_question_stream_fixture(attrs \\ %{}) do
    {:ok, video_question_stream} =
      attrs
      |> Enum.into(%{
        ada_search: "some ada_search",
        type: :filler
      })
      |> Toia.VideosQuestionsStreams.create_video_question_stream()

    video_question_stream
  end
end
