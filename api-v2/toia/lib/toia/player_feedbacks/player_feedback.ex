defmodule Toia.PlayerFeedbacks.PlayerFeedback do
  use Ecto.Schema
  import Ecto.Changeset

  schema "player_feedback" do
    field :question, :string
    field :rating, :integer
    field :video_id, :string
    field :user_id, :id, default: nil
  end

  @doc false
  def changeset(player_feedback, attrs) do
    player_feedback
    |> cast(attrs, [:video_id, :question, :rating])
    |> validate_required([:video_id, :question, :rating])
  end
end
