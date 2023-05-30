defmodule Toia.TrackersFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Toia.Trackers` context.
  """

  @doc """
  Generate a tracker.
  """
  def tracker_fixture(attrs \\ %{}) do
    {:ok, tracker} =
      attrs
      |> Enum.into(%{
        activity: "some activity",
        end_time: 42,
        old_video_id: "some old_video_id",
        start_time: 42,
        track_id: 42,
        video_id: "some video_id"
      })
      |> Toia.Trackers.create_tracker()

    tracker
  end
end
