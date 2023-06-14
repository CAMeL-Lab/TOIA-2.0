defmodule Toia.VideosFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Toia.Videos` context.
  """

  @doc """
  Generate a video.
  """
  def video_fixture(attrs \\ %{}) do
    {:ok, video} =
      attrs
      |> Enum.into(%{
        answer: "some answer",
        duration_seconds: 42,
        idx: 42,
        language: "some language",
        likes: 42,
        private: true,
        views: 42
      })
      |> Toia.Videos.create_video()

    video
  end
end
