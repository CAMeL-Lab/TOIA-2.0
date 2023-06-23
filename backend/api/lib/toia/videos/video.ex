defmodule Toia.Videos.Video do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id_video, :string, []}
  @derive {Phoenix.Param, key: :id_video}

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
    |> cast(attrs, [:id_video, :idx, :private, :answer, :language, :likes, :views, :duration_seconds, :toia_id])
    |> validate_required([:id_video, :idx, :private, :answer, :language, :likes, :views, :duration_seconds, :toia_id])
  end
end
