defmodule Toia.Trackers.Tracker do
  use Ecto.Schema
  import Ecto.Changeset

  schema "tracker" do
    field :activity, :string
    field :end_time, :integer, default: nil
    field :old_video_id, :string, default: nil
    field :start_time, :integer
    field :track_id, :integer
    field :video_id, :string, default: nil
    field :user_id, :id
  end

  @doc false
  def changeset(tracker, attrs) do
    tracker
    |> cast(attrs, [:track_id, :activity, :start_time, :end_time, :video_id, :old_video_id])
    |> validate_required([:track_id, :activity, :start_time, :end_time, :video_id, :old_video_id])
  end
end
