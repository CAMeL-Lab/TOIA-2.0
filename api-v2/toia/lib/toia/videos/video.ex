defmodule Toia.Videos.Video do
  use Ecto.Schema
  import Ecto.Changeset

  schema "video" do
    field :answer, :string
    field :duration_seconds, :integer
    field :idx, :integer
    field :language, :string
    field :likes, :integer, default: 0
    field :private, :boolean, default: false
    field :views, :integer, default: 0
    field :toia_id, :id
  end

  @doc false
  def changeset(video, attrs) do
    video
    |> cast(attrs, [:idx, :private, :answer, :language, :likes, :views, :duration_seconds])
    |> validate_required([:idx, :private, :answer, :language, :likes, :views, :duration_seconds])
  end
end
