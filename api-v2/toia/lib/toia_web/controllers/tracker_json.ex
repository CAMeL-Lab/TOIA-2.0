defmodule ToiaWeb.TrackerJSON do
  alias Toia.Trackers.Tracker

  @doc """
  Renders a list of tracker.
  """
  def index(%{tracker: tracker}) do
    %{data: for(tracker <- tracker, do: data(tracker))}
  end

  @doc """
  Renders a single tracker.
  """
  def show(%{tracker: tracker}) do
    %{data: data(tracker)}
  end

  defp data(%Tracker{} = tracker) do
    %{
      id: tracker.id,
      track_id: tracker.track_id,
      activity: tracker.activity,
      start_time: tracker.start_time,
      end_time: tracker.end_time,
      video_id: tracker.video_id,
      old_video_id: tracker.old_video_id
    }
  end
end
